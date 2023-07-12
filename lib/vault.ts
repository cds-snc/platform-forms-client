import { QueryCommand, QueryCommandInput, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { VaultSubmissionList, UserAbility, VaultStatus } from "@lib/types";
import { logEvent } from "./auditLogs";
import {
  numberOfUnprocessedSubmissionsCacheCheck,
  numberOfUnprocessedSubmissionsCachePut,
} from "./cache/unprocessedSubmissionsCache";
import { connectToDynamo } from "./integration/dynamodbConnector";
import { logMessage } from "./logger";
import { AccessControlError, checkPrivileges } from "./privileges";
import { BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { chunkArray } from "@lib/utils";
import { VaultSubmissionAndConfirmationList } from "@lib/types/retrieval-types";

/**
 * Returns the users associated with a Template
 * Used in checkPrivileges to verify access control
 * @param formID - The form ID to check for access control
 */
async function getUsersForForm(formID: string) {
  const templateOwners = await prisma.template
    .findUnique({
      where: {
        id: formID,
      },
      select: {
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  return templateOwners?.users;
}

export async function checkAbilityToAccessSubmissions(ability: UserAbility, formID: string) {
  const templateOwners = await getUsersForForm(formID);
  if (!templateOwners)
    throw new AccessControlError(
      `Template ${formID} must have associated owners to access responses`
    );

  // Will throw an access control error if not authorized to access
  checkPrivileges(ability, [
    {
      action: "view",
      subject: {
        type: "FormRecord",
        object: {
          users: templateOwners,
        },
      },
    },
  ]);
}

export async function checkAbilityToDeleteSubmissions(ability: UserAbility, formID: string) {
  const templateOwners = await getUsersForForm(formID);
  if (!templateOwners)
    throw new AccessControlError(
      `Template ${formID} must have associated owners to access responses`
    );

  // Will throw an access control error if not authorized to access
  checkPrivileges(ability, [
    {
      action: "delete",
      subject: {
        type: "FormRecord",
        object: {
          users: templateOwners,
        },
      },
    },
  ]);
}

/**
 * This method returns a list of all form submission records.
 * The list does not contain the actual submission data, only attributes
 * @param formID - The form ID from which to retrieve responses
 */

export async function listAllSubmissions(
  ability: UserAbility,
  formID: string
): Promise<{ submissions: VaultSubmissionList[]; numberOfUnprocessedSubmissions: number }> {
  // Check access control first
  try {
    await checkAbilityToAccessSubmissions(ability, formID);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Response" },
        "AccessDenied",
        `Attempted to list all responses for form ${formID}`
      );
    throw e;
  }

  try {
    const documentClient = connectToDynamo();

    let accumulatedResponses: VaultSubmissionList[] = [];
    let lastEvaluatedKey = null;

    while (lastEvaluatedKey !== undefined) {
      const getItemsDbParams: QueryCommandInput = {
        TableName: "Vault",
        // Limit the amount of response to 500.  This can be changed in the future once we have pagination.
        Limit: 500 - accumulatedResponses.length,
        ExclusiveStartKey: lastEvaluatedKey ?? undefined,
        KeyConditionExpression: "FormID = :formID and begins_with(NAME_OR_CONF, :namePrefix)",
        ExpressionAttributeValues: {
          ":formID": formID,
          ":namePrefix": "NAME#",
        },
        ExpressionAttributeNames: {
          "#status": "Status",
          "#name": "Name",
        },
        ProjectionExpression:
          "FormID,#status,SecurityAttribute,#name,CreatedAt,LastDownloadedBy,ConfirmTimestamp,DownloadedAt,RemovalDate",
      };
      const queryCommand = new QueryCommand(getItemsDbParams);
      // eslint-disable-next-line no-await-in-loop
      const response = await documentClient.send(queryCommand);

      if (response.Items?.length) {
        accumulatedResponses = accumulatedResponses.concat(
          response.Items.map(
            ({
              FormID: formID,
              SecurityAttribute: securityAttribute,
              Status: status,
              CreatedAt: createdAt,
              LastDownloadedBy: lastDownloadedBy,
              Name: name,
              ConfirmTimestamp: confirmedAt,
              DownloadedAt: downloadedAt,
              RemovalDate: removedAt,
            }) => ({
              formID,
              status,
              securityAttribute,
              name,
              createdAt,
              lastDownloadedBy: lastDownloadedBy ?? null,
              confirmedAt: confirmedAt ?? null,
              downloadedAt: downloadedAt ?? null,
              removedAt: removedAt ?? null,
            })
          )
        );
      }

      // We either manually stop the paginated request when we have 10 or more items or we let it finish on its own
      if (accumulatedResponses.length >= 500) {
        lastEvaluatedKey = undefined;
      } else {
        lastEvaluatedKey = response.LastEvaluatedKey;
      }
    }

    logEvent(
      ability.userID,
      { type: "Response" },
      "ListResponses",
      `List all responses for form ${formID}`
    );

    const numOfUnprocessedSubmissions = accumulatedResponses.filter((submission) =>
      [VaultStatus.NEW, VaultStatus.DOWNLOADED, VaultStatus.PROBLEM].includes(submission.status)
    ).length;

    await numberOfUnprocessedSubmissionsCachePut(formID, numOfUnprocessedSubmissions);

    return {
      submissions: accumulatedResponses,
      numberOfUnprocessedSubmissions: numOfUnprocessedSubmissions,
    };
  } catch (e) {
    logMessage.error(e);
    return { submissions: [], numberOfUnprocessedSubmissions: 0 };
  }
}
/**
 * This method returns a list of all form submission and confirmations records.
 * The list does not contain the actual submission data, only attributes
 * @param ability - The user ability object
 * @param formID - The form ID from which to retrieve responses
 * @returns {Promise<{submissions: VaultSubmissionAndConfirmationList[]}>} - The list of submissions and confirmations
 */
export async function listAllSubmissionsAndConfirmations(
  ability: UserAbility,
  formID: string
): Promise<{ submissions: VaultSubmissionAndConfirmationList[] }> {
  try {
    await checkAbilityToAccessSubmissions(ability, formID);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Response" },
        "AccessDenied",
        `Attempted to access all submissions and confirmations for form ${formID}`
      );
    throw e;
  }

  try {
    const documentClient = connectToDynamo();

    let responses: VaultSubmissionAndConfirmationList[] = [];
    const getItemsDbParams: QueryCommandInput = {
      TableName: "Vault",
      KeyConditionExpression: "FormID = :formID and begins_with(NAME_OR_CONF, :namePrefix)",
      ExpressionAttributeValues: {
        ":formID": formID,
        ":namePrefix": "NAME#",
      },
      ExpressionAttributeNames: {
        "#status": "Status",
        "#name": "Name",
      },
      ProjectionExpression: "FormID,#status,#name,ConfirmationCode",
    };
    const queryCommand = new QueryCommand(getItemsDbParams);
    const response = await documentClient.send(queryCommand);

    if (response.Items?.length) {
      responses = response.Items.map(
        ({ FormID: formID, Status: status, Name: name, ConfirmationCode: confirmationCode }) => ({
          formID,
          status,
          name,
          confirmationCode: confirmationCode ?? null,
        })
      );
    }

    logEvent(
      ability.userID,
      { type: "Response" },
      "ListResponses",
      `List all responses for form ${formID}`
    );

    return {
      submissions: responses,
    };
  } catch (e) {
    logMessage.error(e);
    return { submissions: [] };
  }
}

/**
 * This method returns the number of unprocessed submissions (submission with a status equal to 'New' or 'Downloaded')
 * @param formID - The form ID from which to retrieve responses
 */

export async function numberOfUnprocessedSubmissions(
  ability: UserAbility,
  formID: string,
  ignoreCache = false
): Promise<number> {
  const cachedNumberOfUnprocessedSubmissions = await numberOfUnprocessedSubmissionsCacheCheck(
    formID
  );

  if (cachedNumberOfUnprocessedSubmissions && !ignoreCache) {
    return cachedNumberOfUnprocessedSubmissions;
  } else {
    const allSubmissions = await listAllSubmissions(ability, formID);
    return allSubmissions.numberOfUnprocessedSubmissions;
  }
}

export async function deleteResponses(
  ability: UserAbility,
  dynamoDb: DynamoDBDocumentClient,
  formResponses: NonNullable<VaultSubmissionAndConfirmationList>[],
  formID: string
): Promise<{ responsesDeleted: number }> {
  try {
    await checkAbilityToDeleteSubmissions(ability, formID);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Response" },
        "AccessDenied",
        `Attempted to delete all responses for form ${formID}`
      );
    throw e;
  }

  const formStatus = await prisma.template
    .findUnique({
      where: {
        id: formID,
      },
      select: {
        isPublished: true,
      },
    })
    .catch((e) => prismaErrors(e, true));

  if (formStatus && typeof formStatus !== "boolean" && formStatus?.isPublished) {
    throw new Error("Form is published. Cannot delete draft form responses.");
  }

  let responsesDeleted = 0;

  /**
   * The `BatchWriteItemCommand` can only take up to 25 `DeleteRequest` at a time.
   * We have to delete 2 items from DynamoDB for each form response (12*2=24).
   */
  for (const formResponsesChunk of chunkArray(formResponses, 12)) {
    const deleteRequests = formResponsesChunk.flatMap(
      (formResponse: VaultSubmissionAndConfirmationList) => {
        return [
          {
            DeleteRequest: {
              Key: {
                FormID: {
                  S: formResponse.formID,
                },
                NAME_OR_CONF: {
                  S: `NAME#${formResponse.name}`,
                },
              },
            },
          },
          {
            DeleteRequest: {
              Key: {
                FormID: {
                  S: formResponse.formID,
                },
                NAME_OR_CONF: {
                  S: `CONF#${formResponse.confirmationCode}`,
                },
              },
            },
          },
        ];
      }
    );

    const batchWriteItemCommandInput = {
      RequestItems: {
        ["Vault"]: deleteRequests,
      },
    };

    let response;
    try {
      // eslint-disable-next-line no-await-in-loop
      response = await dynamoDb.send(new BatchWriteItemCommand(batchWriteItemCommandInput));
      responsesDeleted += deleteRequests.length / 2;
    } catch (e) {
      throw new Error(`Failed to delete form responses from DynamoDB.`);
    }
  }
  return { responsesDeleted };
}

/**
 * This method gets all draft form responses for a given form and deletes them
 * @param ability
 * @param formID
 */
export async function deleteDraftFormTestResponses(ability: UserAbility, formID: string) {
  try {

    const draftFormSubmissionsList = await listAllSubmissionsAndConfirmations(ability, formID);

    const documentClient = connectToDynamo();

    const result = await deleteResponses(
      ability,
      documentClient,
      draftFormSubmissionsList.submissions,
      formID
    );

    if (result.responsesDeleted !== draftFormSubmissionsList.submissions.length) {
      throw new Error(`Failed to delete all draft form submissions.`);
    }
    return {
      responsesDeleted: result.responsesDeleted,
    };
  } catch (error) {
    logMessage.error(error as Error);
    throw error;
  }
}
