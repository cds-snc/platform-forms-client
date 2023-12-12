import {
  BatchGetCommand,
  QueryCommand,
  QueryCommandInput,
  TransactWriteCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { VaultSubmissionList, UserAbility, VaultStatus, VaultSubmission } from "@lib/types";
import { logEvent } from "./auditLogs";
import {
  unprocessedSubmissionsCacheCheck,
  unprocessedSubmissionsCachePut,
} from "./cache/unprocessedSubmissionsCache";
import { connectToDynamo } from "./integration/dynamodbConnector";
import { logMessage } from "./logger";
import { AccessControlError, checkPrivileges } from "./privileges";
import { chunkArray } from "@lib/utils";
import { TemplateAlreadyPublishedError } from "@lib/templates";
import { getAppSetting } from "./appSettings";
import { runPromisesSynchronously } from "./clientHelpers";

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
 * Checks if any submissions exist for a given form and type
 * @param formID - The form ID to check for submissions
 * @param status - The vault status to verify
 */

const submissionTypeExists = async (ability: UserAbility, formID: string, status: VaultStatus) => {
  await checkAbilityToAccessSubmissions(ability, formID).catch((e) => {
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
  });
  const documentClient = connectToDynamo();

  const getItemsDbParams: QueryCommandInput = {
    TableName: "Vault",
    IndexName: "Status",
    // Limit the amount of responses 1.
    // A single record existing is enough to trigger the boolean
    Limit: 1,
    KeyConditionExpression: "FormID = :formID AND #status = :status",
    // Sort by descending order of Status
    ScanIndexForward: false,
    ExpressionAttributeValues: {
      ":formID": formID,
      ":status": status,
    },
    ExpressionAttributeNames: {
      "#status": "Status",
      "#name": "Name",
    },
    ProjectionExpression: "FormID,#status,#name",
  };
  const queryCommand = new QueryCommand(getItemsDbParams);
  // eslint-disable-next-line no-await-in-loop
  const response = await documentClient.send(queryCommand);
  return Boolean(response.Items?.length);
};

/**
 * This method returns a list of all form submission records.
 * The list does not contain the actual submission data, only attributes
 * @param formID - The form ID from which to retrieve responses
 */
export async function listAllSubmissions(
  ability: UserAbility,
  formID: string,
  status?: VaultStatus,
  lastEvaluatedKey: Record<string, string> | null | undefined = null,
  scanForward = true
): Promise<{
  submissions: VaultSubmissionList[];
  submissionsRemaining: boolean;
  lastEvaluatedKey: Record<string, string> | null | undefined;
}> {
  // Check access control first
  try {
    await checkAbilityToAccessSubmissions(ability, formID).catch((e) => {
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
    });
    const responseDownloadLimit = Number(await getAppSetting("responseDownloadLimit"));
    // We're going to request one more than the limit so we can consistently determine if there are more responses
    const responseRetrievalLimit = responseDownloadLimit + 1;

    const documentClient = connectToDynamo();

    let accumulatedResponses: VaultSubmissionList[] = [];
    let submissionsRemaining = false;
    let paginationLastEvaluatedKey = null;

    while (lastEvaluatedKey !== undefined) {
      const getItemsDbParams: QueryCommandInput = {
        TableName: "Vault",
        IndexName: "Status",
        ExclusiveStartKey: lastEvaluatedKey ?? undefined,
        // Limit the amount of response to responseRetrievalLimit
        Limit: responseRetrievalLimit - accumulatedResponses.length,
        KeyConditionExpression: "FormID = :formID" + (status ? " AND #status = :status" : ""),
        // Sort by descending order of Status
        ScanIndexForward: scanForward,
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
      if (accumulatedResponses.length >= responseRetrievalLimit) {
        lastEvaluatedKey = undefined;
      } else {
        lastEvaluatedKey = response.LastEvaluatedKey;
      }
    }

    if (accumulatedResponses.length > responseDownloadLimit) {
      // Since we're requesting one more than the limit, we need to remove the last item
      const lastResponse = accumulatedResponses[accumulatedResponses.length - 2];
      accumulatedResponses = accumulatedResponses.slice(0, responseDownloadLimit);

      // Create a lastEvaluatedKey from lastResponse for pagination
      paginationLastEvaluatedKey = {
        Status: lastResponse.status,
        NAME_OR_CONF: `NAME#${lastResponse.name}`,
        FormID: lastResponse.formID,
      };
      submissionsRemaining = true;
    } else {
      paginationLastEvaluatedKey = null;
      submissionsRemaining = false;
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
    return {
      submissions: accumulatedResponses,
      submissionsRemaining: submissionsRemaining,
      lastEvaluatedKey: paginationLastEvaluatedKey,
    };
  } catch (e) {
    logMessage.error(e);
    return { submissions: [], submissionsRemaining: true, lastEvaluatedKey: undefined };
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

    const keys = ids.map((id) => {
      return { FormID: formID, NAME_OR_CONF: `NAME#${id.trim()}` };
    }) as Record<string, string>[];

    const chunkedKeys = chunkArray(keys, 100);

    // DynamoDB BatchGetItem can only retrieve 100 items at a time
    // Create function that will run the batch in parallel
    const dbQuery = async (keys: Record<string, string>[]) => {
      const documentClient = connectToDynamo();
      let accumulatedResponses: VaultSubmission[] = [];
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
      return accumulatedResponses;
    };

    // Run the batch in parallel
    const submissions = (await Promise.all(chunkedKeys.map((keys) => dbQuery(keys)))).flat();
    // Log each response retrieved
    submissions.forEach((item) => {
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

    return submissions;
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

    return () => documentClient.send(request);
  });

  // @todo - handle errors that can result from failing TransactWriteCommand operations
  return runPromisesSynchronously(asyncUpdateRequests);
}

/**
 * This method returns a boolean dependent if unprocessed submissions (submission with a status equal to 'New' or 'Downloaded') exist.
 * @param formID - The form ID from which to retrieve responses
 */

export async function unprocessedSubmissions(
  ability: UserAbility,
  formID: string,
  ignoreCache = false
): Promise<boolean> {
  const cachedUnprocessedSubmissions = await unprocessedSubmissionsCacheCheck(formID);

  if (cachedUnprocessedSubmissions && !ignoreCache) {
    return cachedUnprocessedSubmissions;
  } else {
    const responseArray = await Promise.all([
      submissionTypeExists(ability, formID, VaultStatus.NEW),
      submissionTypeExists(ability, formID, VaultStatus.DOWNLOADED),
    ]);

    // If one of the responses is true then there are unprocessed submissions
    const unprocessedSubmissions = responseArray.some((response) => response);

    await unprocessedSubmissionsCachePut(formID, unprocessedSubmissions);
    return unprocessedSubmissions;
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
    // The `BatchWriteCommand` can only take up to 25 `DeleteRequest` at a time.

    const asyncDeleteRequests = chunkArray(accumulatedResponses, 25).map((request) => {
      return () =>
        documentClient.send(
          new BatchWriteCommand({
            RequestItems: {
              Vault: request.map((entryName) => ({
                DeleteRequest: {
                  Key: {
                    FormID: formID,
                    NAME_OR_CONF: entryName,
                  },
                },
              })),
            },
          })
        );
    });

    await runPromisesSynchronously(asyncDeleteRequests);

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
