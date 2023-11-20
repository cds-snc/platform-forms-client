import {
  BatchGetCommand,
  QueryCommand,
  QueryCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { VaultSubmissionList, UserAbility, VaultStatus, VaultSubmission } from "@lib/types";
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
import { TemplateAlreadyPublishedError } from "@lib/templates";
import { getAppSetting } from "./appSettings";

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

async function checkAbilityToAccessSubmissions(ability: UserAbility, formID: string) {
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

/**
 * This method returns a list of all form submission records.
 * The list does not contain the actual submission data, only attributes
 * @param formID - The form ID from which to retrieve responses
 */
export async function listAllSubmissions(
  ability: UserAbility,
  formID: string,
  status?: VaultStatus
): Promise<{ submissions: VaultSubmissionList[]; numberOfUnprocessedSubmissions: number }> {
  // Check access control first
  try {
    await checkAbilityToAccessSubmissions(ability, formID);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        {
          type: "Form",
          id: formID,
        },
        "AccessDenied",
        `Attempted to list responses for form ${formID}`
      );
    throw e;
  }

  try {
    const responseDownloadLimit = Number(await getAppSetting("responseDownloadLimit"));

    const documentClient = connectToDynamo();

    let accumulatedResponses: VaultSubmissionList[] = [];
    let lastEvaluatedKey = null;

    while (lastEvaluatedKey !== undefined) {
      const getItemsDbParams: QueryCommandInput = {
        TableName: "Vault",
        IndexName: "Status",
        // Limit the amount of response to responseDownloadLimit.  This can be changed in settings.
        Limit: responseDownloadLimit - accumulatedResponses.length,
        ExclusiveStartKey: lastEvaluatedKey ?? undefined,
        KeyConditionExpression: "FormID = :formID" + (status ? " AND #status = :status" : ""),
        // Sort by descending order of Status
        ScanIndexForward: false,
        ExpressionAttributeValues: {
          ":formID": formID,
          ...(status && { ":status": status }),
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

      // We either manually stop the paginated request when we have (responseDownloadLimit) items or we let it finish on its own
      if (accumulatedResponses.length >= responseDownloadLimit) {
        lastEvaluatedKey = undefined;
      } else {
        lastEvaluatedKey = response.LastEvaluatedKey;
      }
    }

    logEvent(
      ability.userID,
      {
        type: "Form",
        id: formID,
      },
      "ListResponses",
      `List all responses ${status ? `of status ${status} ` : ""}for form ${formID}`
    );

    if (!status) {
      // Only update value when we are not filtering by status
      // Will need to rework logic once filtering is implemented on client side
      const numOfUnprocessedSubmissions = accumulatedResponses.filter((submission) =>
        [VaultStatus.NEW, VaultStatus.DOWNLOADED, VaultStatus.PROBLEM].includes(submission.status)
      ).length;

      await numberOfUnprocessedSubmissionsCachePut(formID, numOfUnprocessedSubmissions);
      return {
        submissions: accumulatedResponses,
        numberOfUnprocessedSubmissions: numOfUnprocessedSubmissions,
      };
    } else {
      // This should never be triggered in the applications current state but is used as a fallback
      // to ensure typescript is happy
      const numOfUnprocessedSubmissions = await numberOfUnprocessedSubmissionsCacheCheck(formID);
      return {
        submissions: accumulatedResponses,
        numberOfUnprocessedSubmissions: numOfUnprocessedSubmissions ?? 0,
      };
    }
  } catch (e) {
    logMessage.error(e);
    return { submissions: [], numberOfUnprocessedSubmissions: 0 };
  }
}

/**
 * This method returns a list of selected form submission records.
 * The list contains the actual submission data
 * @param formID - The form ID from which to retrieve responses
 */
export async function retrieveSubmissions(
  ability: UserAbility,
  formID: string,
  ids: string[]
): Promise<VaultSubmission[]> {
  // Check access control first
  try {
    await checkAbilityToAccessSubmissions(ability, formID);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        {
          type: "Form",
          id: formID,
        },
        "AccessDenied",
        `Attempted to retrieve responses for form ${formID}`
      );
    throw e;
  }

  try {
    let accumulatedResponses: VaultSubmission[] = [];
    const documentClient = connectToDynamo();

    let keys = ids.map((id) => {
      return { FormID: formID, NAME_OR_CONF: `NAME#${id.trim()}` };
    }) as Record<string, string>[];

    // DynamoDB BatchGetItem can only retrieve 100 items at a time
    while (keys && keys.length > 0) {
      const queryCommand = new BatchGetCommand({
        RequestItems: {
          Vault: {
            Keys: keys,
            ProjectionExpression:
              "FormID,SubmissionID,FormSubmission,ConfirmationCode,#status,SecurityAttribute,#name,CreatedAt,LastDownloadedBy,ConfirmTimestamp,DownloadedAt,RemovalDate",
            ExpressionAttributeNames: {
              "#name": "Name",
              "#status": "Status",
            },
          },
        },
      });

      // eslint-disable-next-line no-await-in-loop
      const response = await documentClient.send(queryCommand);

      if (response.Responses?.Vault.length) {
        accumulatedResponses = accumulatedResponses.concat(
          response.Responses.Vault.map((item) => {
            return {
              formID: item.FormID,
              submissionID: item.SubmissionID,
              formSubmission: item.FormSubmission,
              confirmationCode: item.ConfirmationCode,
              status: item.Status as VaultStatus,
              securityAttribute: item.SecurityAttribute,
              name: item.Name,
              createdAt: item.CreatedAt,
              lastDownloadedBy: item.LastDownloadedBy ?? null,
              confirmedAt: item.ConfirmTimestamp ?? null,
              downloadedAt: item.DownloadedAt ?? null,
              removedAt: item.RemovalDate ?? null,
            } as VaultSubmission;
          })
        );
      }

      // If there are unprocessed keys, we need to make another request
      keys = response.UnprocessedKeys?.Vault?.Keys || [];
    }

    // Log each response retrieved
    accumulatedResponses.forEach((item) => {
      logEvent(
        ability.userID,
        {
          type: "Response",
          id: item.submissionID,
        },
        "RetrieveResponses",
        `Retrieve selected responses for form ${formID} with ID ${item.submissionID}`
      );
    });

    return accumulatedResponses;
  } catch (e) {
    logMessage.error(e);
    return [];
  }
}

/**
 * Sets who last downloaded the Form Submission on the Vault Submission record
 * Note that if any single update fails, the entire transaction will fail
 * @param responses Array of responses (id, status) to update
 * @param formID Form ID the Submission is for
 * @param email Email address of the user downloading the Submission
 */
export async function updateLastDownloadedBy(
  responses: Array<{ id: string; status: string }>,
  formID: string,
  email: string
) {
  const documentClient = connectToDynamo();

  // TransactWriteItem can only update 100 items at a time
  const asyncUpdateRequests = chunkArray(responses, 100).map((chunkedResponses) => {
    const request = new TransactWriteCommand({
      TransactItems: chunkedResponses.map((response) => {
        const isNewResponse = response.status === VaultStatus.NEW;
        return {
          Update: {
            TableName: "Vault",
            Key: {
              FormID: formID,
              NAME_OR_CONF: `NAME#${response.id}`,
            },
            UpdateExpression: "SET LastDownloadedBy = :email, DownloadedAt = :downloadedAt".concat(
              isNewResponse ? ", #status = :statusUpdate" : ""
            ),
            ExpressionAttributeValues: {
              ":email": email,
              ":downloadedAt": Date.now(),
              ...(isNewResponse && { ":statusUpdate": "Downloaded" }),
            },
            ...(isNewResponse && {
              ExpressionAttributeNames: {
                "#status": "Status",
              },
            }),
          },
        };
      }),
    });
    return documentClient.send(request);
  });

  return Promise.all(asyncUpdateRequests);
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

/**
 * This method gets all draft form responses for a given form and deletes them
 * @param ability
 * @param formID
 */
export async function deleteDraftFormResponses(ability: UserAbility, formID: string) {
  try {
    const documentClient = connectToDynamo();

    // Ensure users are owners of the form
    await checkAbilityToAccessSubmissions(ability, formID).catch((error) => {
      if (error instanceof AccessControlError) {
        logEvent(
          ability.userID,
          { type: "Form", id: formID },
          "AccessDenied",
          `Attempted to delete all responses for form ${formID}`
        );
      }
      throw error;
    });
    // Ensure the form is not published
    const template = await prisma.template
      .findUnique({ where: { id: formID }, select: { isPublished: true } })
      .catch((e) => prismaErrors(e, null));

    if (template?.isPublished) {
      throw new TemplateAlreadyPublishedError(
        "Form is published. Cannot delete draft form responses."
      );
    }

    // Internal Prisma Error / Abort action
    if (template === null) {
      throw new Error("Form not found or Prisma error.");
    }

    // Get all entry names for formID in vault

    let accumulatedResponses: string[] = [];
    let lastEvaluatedKey = null;

    while (lastEvaluatedKey !== undefined) {
      const getItemsDbParams: QueryCommandInput = {
        TableName: "Vault",
        ExclusiveStartKey: lastEvaluatedKey ?? undefined,
        KeyConditionExpression: "FormID = :formID",
        ExpressionAttributeValues: {
          ":formID": formID,
        },
        ProjectionExpression: "NAME_OR_CONF",
      };
      const queryCommand = new QueryCommand(getItemsDbParams);
      // eslint-disable-next-line no-await-in-loop
      const response = await documentClient.send(queryCommand);

      if (response.Items?.length) {
        accumulatedResponses = accumulatedResponses.concat(
          ...response.Items.map((item) => item.NAME_OR_CONF)
        );
      }
      lastEvaluatedKey = response.LastEvaluatedKey;
    }

    logMessage.debug(`Found ${accumulatedResponses.length} draft responses for form ${formID}.`);
    logMessage.debug(accumulatedResponses);

    // Batch delete all entries
    // The `BatchWriteItemCommand` can only take up to 25 `DeleteRequest` at a time.

    const asyncDeleteRequests = chunkArray(accumulatedResponses, 25).map((request) => {
      return documentClient.send(
        new BatchWriteItemCommand({
          RequestItems: {
            ["Vault"]: request.map((entryName) => ({
              DeleteRequest: {
                Key: {
                  FormID: {
                    S: formID,
                  },
                  NAME_OR_CONF: {
                    S: entryName,
                  },
                },
              },
            })),
          },
        })
      );
    });

    await Promise.all(asyncDeleteRequests);
    logEvent(
      ability.userID,
      { type: "Form", id: formID },
      "DeleteResponses",
      `Deleted draft responses for form ${formID}.`
    );

    return {
      responsesDeleted: accumulatedResponses.length,
    };
  } catch (error) {
    logMessage.error(
      `Failed to delete form responses from the Vault during publishing for form ${formID}.`
    );
    logMessage.error((error as Error).message);
    throw error;
  }
}
