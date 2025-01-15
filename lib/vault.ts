import {
  BatchGetCommand,
  QueryCommand,
  QueryCommandInput,
  TransactWriteCommand,
  BatchWriteCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import {
  VaultSubmissionOverview,
  VaultStatus,
  VaultSubmission,
  StartFromExclusiveResponse,
} from "@lib/types";
import { logEvent } from "./auditLogs";
import {
  unprocessedSubmissionsCacheCheck,
  unprocessedSubmissionsCachePut,
} from "./cache/unprocessedSubmissionsCache";
import { dynamoDBDocumentClient } from "./integration/awsServicesConnector";
import { logMessage } from "./logger";
import { authorization } from "./privileges";
import { AccessControlError } from "@lib/auth/errors";
import { chunkArray } from "@lib/utils";
import { TemplateAlreadyPublishedError } from "@lib/templates";
import { getAppSetting } from "./appSettings";
import { delay, getExponentialBackoffTimeInMS } from "./utils/retryability";

/**
 * Checks if any submissions exist for a given form and type
 * @param formID - The form ID to check for submissions
 * @param status - The vault status to verify
 */

export const submissionTypeExists = async (formID: string, status: VaultStatus) => {
  await authorization.canViewForm(formID).catch((e) => {
    if (e instanceof AccessControlError)
      logEvent(
        e.user.id,
        {
          type: "Form",
          id: formID,
        },
        "AccessDenied",
        `Attempted to check response status for form ${formID}`
      );
    throw e;
  });

  const shouldNavigateThroughStatusCreatedAtIndexInAscendingOrder = (
    status: VaultStatus
  ): boolean => {
    switch (status) {
      case VaultStatus.CONFIRMED:
      case VaultStatus.DOWNLOADED:
        return true;
      default:
        return false;
    }
  };

  const queryCommand = new QueryCommand({
    TableName: "Vault",
    IndexName: "StatusCreatedAt",
    // To optimize query since we only need to check whether one type of submission type exists
    ScanIndexForward: shouldNavigateThroughStatusCreatedAtIndexInAscendingOrder(status),
    // Limit the amount of responses to 1.
    // A single record existing is enough to trigger the boolean
    Limit: 1,
    KeyConditionExpression: "FormID = :formID AND begins_with(#statusCreatedAtKey, :status)",
    ExpressionAttributeNames: {
      "#statusCreatedAtKey": "Status#CreatedAt",
    },
    ExpressionAttributeValues: {
      ":formID": formID,
      ":status": status,
    },
    ProjectionExpression: "FormID",
  });

  const response = await dynamoDBDocumentClient.send(queryCommand);
  return Boolean(response.Items?.length);
};

/**
 * This method returns a list of all form submission records.
 * The list does not contain the actual submission data, only attributes
 * @param formID - The form ID from which to retrieve responses
 */
export async function listAllSubmissions(
  formID: string,
  status?: VaultStatus,
  responseDownloadLimit?: number,
  startFromExclusiveResponse?: StartFromExclusiveResponse
): Promise<{
  submissions: VaultSubmissionOverview[];
  submissionsRemaining: boolean;
  startFromExclusiveResponse?: StartFromExclusiveResponse;
}> {
  // Check access control first
  try {
    const { user } = await authorization.canViewForm(formID).catch((e) => {
      if (e instanceof AccessControlError)
        logEvent(
          e.user.id,
          {
            type: "Form",
            id: formID,
          },
          "AccessDenied",
          `Attempted to list responses for form ${formID}`
        );
      throw e;
    });

    if (!responseDownloadLimit) {
      responseDownloadLimit = Number(await getAppSetting("responseDownloadLimit"));
    }

    // We're going to request one more than the limit so we can consistently determine if there are more responses
    const responseRetrievalLimit = responseDownloadLimit + 1;

    let accumulatedResponses: VaultSubmissionOverview[] = [];
    let lastEvaluatedKey: Record<string, unknown> | undefined | null = startFromExclusiveResponse
      ? {
          NAME_OR_CONF: `NAME#${startFromExclusiveResponse.name}`,
          "Status#CreatedAt": `${startFromExclusiveResponse.status}#${startFromExclusiveResponse.createdAt}`,
          FormID: formID,
        }
      : null;

    while (lastEvaluatedKey !== undefined) {
      const queryCommand: QueryCommand = new QueryCommand({
        TableName: "Vault",
        IndexName: "StatusCreatedAt",
        ExclusiveStartKey: lastEvaluatedKey ?? undefined,
        // Limit the amount of response to responseRetrievalLimit
        Limit: responseRetrievalLimit - accumulatedResponses.length,
        KeyConditionExpression:
          "FormID = :formID" + (status ? " AND begins_with(#statusCreatedAtKey, :status)" : ""),
        ExpressionAttributeNames: {
          "#statusCreatedAtKey": "Status#CreatedAt",
          "#name": "Name",
        },
        ExpressionAttributeValues: {
          ":formID": formID,
          ...(status && { ":status": status }),
        },
        ProjectionExpression: "FormID,#name,CreatedAt,#statusCreatedAtKey",
      });

      // eslint-disable-next-line no-await-in-loop
      const response = await dynamoDBDocumentClient.send(queryCommand);

      if (response.Items?.length) {
        accumulatedResponses = accumulatedResponses.concat(
          response.Items.map(
            ({
              FormID: formID,
              "Status#CreatedAt": statusCreatedAt,
              CreatedAt: createdAt,
              Name: name,
            }) => ({
              formID,
              status: vaultStatusFromStatusCreatedAt(statusCreatedAt),
              name,
              createdAt,
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

    let submissionsRemaining = false;
    let paginationStartFromExclusiveResponse: StartFromExclusiveResponse | undefined = undefined;

    if (accumulatedResponses.length > responseDownloadLimit) {
      // Since we're requesting one more than the limit, we need to remove the last item
      const lastResponse = accumulatedResponses[accumulatedResponses.length - 2];
      accumulatedResponses = accumulatedResponses.slice(0, responseDownloadLimit);

      submissionsRemaining = true;
      paginationStartFromExclusiveResponse = {
        name: lastResponse.name,
        status: lastResponse.status,
        createdAt: lastResponse.createdAt,
      };
    } else {
      submissionsRemaining = false;
    }

    logEvent(
      user.id,
      {
        type: "Form",
        id: formID,
      },
      "ListResponses",
      `List all responses ${status ? `of status ${status} ` : ""}for form ${formID}`
    );

    logMessage.info("HealthCheck: list submissions success");

    return {
      submissions: accumulatedResponses,
      submissionsRemaining: submissionsRemaining,
      startFromExclusiveResponse: paginationStartFromExclusiveResponse,
    };
  } catch (e) {
    // Expected to error in APP_ENV test mode as dynamodb is not available
    if (process.env.APP_ENV !== "test") {
      logMessage.info("HealthCheck: list submissions failure");
      logMessage.error(e);
    }

    return { submissions: [], submissionsRemaining: true };
  }
}

/**
 * This method returns the `RemovalDate` for a specific submission.
 * @param formID - The form ID of the response you want to retrieve
 * @param submissionName - The submission name of the response you want to retrieve
 */
export async function retrieveSubmissionRemovalDate(
  formID: string,
  submissionName: string
): Promise<number | undefined> {
  // Check access control first
  try {
    await authorization.canViewForm(formID).catch((e) => {
      if (e instanceof AccessControlError)
        logEvent(
          e.user.id,
          {
            type: "Form",
            id: formID,
          },
          "AccessDenied",
          `Attempted to retrieve response for form ${formID}`
        );
      throw e;
    });

    const getCommand = new GetCommand({
      TableName: "Vault",
      Key: {
        FormID: formID,
        NAME_OR_CONF: `NAME#${submissionName}`,
      },
      ProjectionExpression: "RemovalDate",
    });

    const response = await dynamoDBDocumentClient.send(getCommand);

    if (response.Item === undefined || response.Item["RemovalDate"] === undefined) {
      return undefined;
    }

    return response.Item["RemovalDate"];
  } catch (e) {
    // Expected to error in APP_ENV test mode as dynamodb is not available
    if (process.env.APP_ENV !== "test") {
      logMessage.error(e);
    }
    return undefined;
  }
}

/**
 * This method returns a list of selected form submission records.
 * The list contains the actual submission data
 * @param formID - The form ID from which to retrieve responses
 */
export async function retrieveSubmissions(
  formID: string,
  ids: string[]
): Promise<VaultSubmission[]> {
  // Check access control first
  try {
    const { user } = await authorization.canViewForm(formID).catch((e) => {
      if (e instanceof AccessControlError)
        logEvent(
          e.user.id,
          {
            type: "Form",
            id: formID,
          },
          "AccessDenied",
          `Attempted to retrieve responses for form ${formID}`
        );
      throw e;
    });

    const keys = ids.map((id) => {
      return { FormID: formID, NAME_OR_CONF: `NAME#${id.trim()}` };
    }) as Record<string, string>[];

    // DynamoDB BatchGetItem can only retrieve 100 items at a time
    // Reducing to 50 in order to add some throttling
    const chunkedKeys = chunkArray(keys, 50);

    const submissions = [];

    for (let keys of chunkedKeys) {
      let accumulatedResponses: VaultSubmission[] = [];
      let attempt = 1;
      while (keys && keys.length > 0) {
        const queryCommand = new BatchGetCommand({
          RequestItems: {
            Vault: {
              Keys: keys,
              ProjectionExpression:
                "FormID,SubmissionID,FormSubmission,ConfirmationCode,#statusCreatedAtKey,SecurityAttribute,#name,CreatedAt,LastDownloadedBy,ConfirmTimestamp,DownloadedAt,RemovalDate",
              ExpressionAttributeNames: {
                "#name": "Name",
                "#statusCreatedAtKey": "Status#CreatedAt",
              },
            },
          },
        });

        // eslint-disable-next-line no-await-in-loop
        const response = await dynamoDBDocumentClient.send(queryCommand);

        if (response.Responses?.Vault.length) {
          accumulatedResponses = accumulatedResponses.concat(
            response.Responses.Vault.map((item) => {
              return {
                formID: item.FormID,
                submissionID: item.SubmissionID,
                formSubmission: item.FormSubmission,
                confirmationCode: item.ConfirmationCode,
                status: vaultStatusFromStatusCreatedAt(item["Status#CreatedAt"]),
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
        if (response.UnprocessedKeys?.Vault?.Keys) {
          keys = response.UnprocessedKeys.Vault.Keys;
          ++attempt;
          const backOffTime = getExponentialBackoffTimeInMS(100, attempt, 2000, true);
          logMessage.info(
            `Retrying retrieveResponses for form ${formID} attempt ${attempt} in ${backOffTime}ms`
          );
          // eslint-disable-next-line no-await-in-loop
          await delay(backOffTime);
        } else {
          keys = [];
        }
      }
      submissions.push(...accumulatedResponses);

      // Log each response retrieved
      accumulatedResponses.forEach((item) => {
        logEvent(
          user.id,
          {
            type: "Response",
            id: item.submissionID,
          },
          "RetrieveResponses",
          `Retrieve selected responses for form ${formID} with ID ${item.submissionID}`
        );
      });
    }

    logMessage.info("HealthCheck: retrieve submissions success");

    return submissions;
  } catch (e) {
    // Expected to error in APP_ENV test mode as dynamodb is not available
    if (process.env.APP_ENV !== "test") {
      logMessage.info("HealthCheck: retrieve submissions failure");
      logMessage.error(e);
    }

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
  responses: Array<{ id: string; status: string; createdAt: number }>,
  formID: string
) {
  const { user } = await authorization.canViewForm(formID);
  const chunkedResponses = chunkArray(responses, 20);

  for (const [index, chunk] of chunkedResponses.entries()) {
    const request = new TransactWriteCommand({
      TransactItems: chunk.map((response) => {
        const isNewResponse = response.status === VaultStatus.NEW;
        return {
          Update: {
            TableName: "Vault",
            Key: {
              FormID: formID,
              NAME_OR_CONF: `NAME#${response.id}`,
            },
            UpdateExpression: "SET LastDownloadedBy = :email, DownloadedAt = :downloadedAt".concat(
              isNewResponse ? ", #statusCreatedAtKey = :statusCreatedAtValue" : ""
            ),
            ExpressionAttributeValues: {
              ":email": user.email,
              ":downloadedAt": Date.now(),
              ...(isNewResponse && {
                ":statusCreatedAtValue": `Downloaded#${response.createdAt}`,
              }),
            },
            ...(isNewResponse && {
              ExpressionAttributeNames: {
                "#statusCreatedAtKey": "Status#CreatedAt",
              },
            }),
          },
        };
      }),
    });

    if (index > 0) {
      // eslint-disable-next-line no-await-in-loop
      await delay(200);
    }

    // eslint-disable-next-line no-await-in-loop
    await dynamoDBDocumentClient.send(request);
  }
}

/**
 * This method returns a boolean dependent if unprocessed submissions (submission with a status equal to 'New' or 'Downloaded') exist.
 * @param formID - The form ID from which to retrieve responses
 */

export async function unprocessedSubmissions(
  formID: string,
  ignoreCache = false
): Promise<boolean> {
  await authorization.canViewForm(formID);
  const cachedUnprocessedSubmissions = await unprocessedSubmissionsCacheCheck(formID);

  if (cachedUnprocessedSubmissions && !ignoreCache) {
    return cachedUnprocessedSubmissions;
  } else {
    const responseArray = await Promise.all([
      submissionTypeExists(formID, VaultStatus.NEW),
      submissionTypeExists(formID, VaultStatus.DOWNLOADED),
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
export async function deleteDraftFormResponses(formID: string) {
  try {
    const { user } = await authorization.canViewForm(formID).catch((e) => {
      if (e instanceof AccessControlError)
        logEvent(
          e.user.id,
          {
            type: "Form",
            id: formID,
          },
          "AccessDenied",
          `Attempted to delete all responses for form ${formID}`
        );
      throw e;
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
      const response = await dynamoDBDocumentClient.send(queryCommand);

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

    const chunkRequests = chunkArray(accumulatedResponses, 25);
    for (const [index, chunk] of chunkRequests.entries()) {
      if (index > 0) {
        // eslint-disable-next-line no-await-in-loop
        await delay(200);
      }
      // eslint-disable-next-line no-await-in-loop
      await dynamoDBDocumentClient.send(
        new BatchWriteCommand({
          RequestItems: {
            Vault: chunk.map((entryName) => ({
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
    }

    logEvent(
      user.id,
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

async function getSubmissionsFromConfirmationCodes(
  formId: string,
  confirmationCodes: string[]
): Promise<{
  submissionsToConfirm: { name: string; createdAt: number; confirmationCode: string }[];
  confirmationCodesAlreadyUsed: string[];
  confirmationCodesNotFound: string[];
}> {
  await authorization.canViewForm(formId).catch((e) => {
    if (e instanceof AccessControlError)
      logEvent(
        e.user.id,
        {
          type: "Form",
          id: formId,
        },
        "AccessDenied",
        `Attempted to confirm responses for form ${formId}`
      );
    throw e;
  });

  const accumulatedSubmissions: {
    [confCode: string]: { name: string; createdAt: number; removalDate?: number };
  } = {};

  let requestedKeys = confirmationCodes.map((code) => {
    return { FormID: formId, NAME_OR_CONF: `CONF#${code}` };
  });

  while (requestedKeys.length > 0) {
    const request = new BatchGetCommand({
      RequestItems: {
        Vault: {
          Keys: requestedKeys,
          ProjectionExpression: "#name,CreatedAt,ConfirmationCode,RemovalDate",
          ExpressionAttributeNames: {
            "#name": "Name",
          },
        },
      },
    });

    // eslint-disable-next-line no-await-in-loop
    const response = await dynamoDBDocumentClient.send(request);

    if (response.Responses?.Vault) {
      response.Responses.Vault.forEach((record) => {
        accumulatedSubmissions[record["ConfirmationCode"]] = {
          name: record["Name"],
          createdAt: record["CreatedAt"],
          removalDate: record["RemovalDate"],
        };
      });
    }

    if (response.UnprocessedKeys?.Vault?.Keys) {
      requestedKeys = response.UnprocessedKeys.Vault.Keys as {
        FormID: string;
        NAME_OR_CONF: string;
      }[];
    } else {
      requestedKeys = [];
    }
  }

  return confirmationCodes.reduce(
    (acc, currentConfirmationCode) => {
      const submission = accumulatedSubmissions[currentConfirmationCode];

      if (!submission) {
        acc.confirmationCodesNotFound.push(currentConfirmationCode);
      } else if (submission.removalDate) {
        acc.confirmationCodesAlreadyUsed.push(currentConfirmationCode);
      } else {
        acc.submissionsToConfirm.push({
          name: submission.name,
          createdAt: submission.createdAt,
          confirmationCode: currentConfirmationCode,
        });
      }
      return acc;
    },
    {
      submissionsToConfirm: Array<{ name: string; createdAt: number; confirmationCode: string }>(),
      confirmationCodesAlreadyUsed: Array<string>(),
      confirmationCodesNotFound: Array<string>(),
    }
  );
}

export const confirmResponses = async (confirmationCodes: string[], formId: string) => {
  const { user } = await authorization.canViewForm(formId).catch((e) => {
    if (e instanceof AccessControlError)
      logEvent(
        e.user.id,
        {
          type: "Form",
          id: formId,
        },
        "AccessDenied",
        `Attempted to confirm responses for form ${formId}`
      );
    throw e;
  });
  const chunkedCodes = chunkArray(confirmationCodes, 50);
  const accumulatedResults = [];

  for (const codes of chunkedCodes) {
    // eslint-disable-next-line no-await-in-loop
    accumulatedResults.push(await getSubmissionsFromConfirmationCodes(formId, codes));
  }

  const submissionsFromConfirmationCodes = accumulatedResults.reduce(
    (accumulated, result) => {
      accumulated.submissionsToConfirm.push(...result.submissionsToConfirm);
      accumulated.confirmationCodesAlreadyUsed.push(...result.confirmationCodesAlreadyUsed);
      accumulated.confirmationCodesNotFound.push(...result.confirmationCodesNotFound);
      return accumulated;
    },
    {
      submissionsToConfirm: [],
      confirmationCodesAlreadyUsed: [],
      confirmationCodesNotFound: [],
    }
  );

  const unprocessed = [];
  if (submissionsFromConfirmationCodes.submissionsToConfirm.length > 0) {
    // max 50 submissions per request
    const confirmationTimestamp = Date.now();
    const removalDate = confirmationTimestamp + 2592000000; // 2592000000 milliseconds = 30 days

    // Chunked to batches of 25 to spread out the write unit capacity usage
    const chunkedSubmissions = chunkArray(
      submissionsFromConfirmationCodes.submissionsToConfirm,
      25
    );

    for (const submissions of chunkedSubmissions) {
      try {
        const request = new TransactWriteCommand({
          TransactItems: submissions.flatMap((submission) => {
            return [
              {
                Update: {
                  TableName: "Vault",
                  Key: {
                    FormID: formId,
                    NAME_OR_CONF: `NAME#${submission.name}`,
                  },
                  UpdateExpression:
                    "SET #statusCreatedAtKey = :statusCreatedAtValue, ConfirmTimestamp = :confirmTimestamp, RemovalDate = :removalDate",
                  ExpressionAttributeNames: {
                    "#statusCreatedAtKey": "Status#CreatedAt",
                  },
                  ExpressionAttributeValues: {
                    ":statusCreatedAtValue": `Confirmed#${submission.createdAt}`,
                    ":confirmTimestamp": confirmationTimestamp,
                    ":removalDate": removalDate,
                  },
                },
              },
              {
                Update: {
                  TableName: "Vault",
                  Key: {
                    FormID: formId,
                    NAME_OR_CONF: `CONF#${submission.confirmationCode}`,
                  },
                  UpdateExpression: "SET RemovalDate = :removalDate",
                  ExpressionAttributeValues: {
                    ":removalDate": removalDate,
                  },
                },
              },
            ];
          }),
        });

        // eslint-disable-next-line no-await-in-loop
        await dynamoDBDocumentClient.send(request);
        // Done asychronously to not block response back to client
        submissions.forEach((confirmation) =>
          logEvent(
            user.id,
            { type: "Response", id: confirmation.name },
            "ConfirmResponse",
            `Confirmed response for form ${formId}`
          )
        );
      } catch (e) {
        unprocessed.push(...submissions.map((submission) => submission.name));
      }
    }
  }

  logMessage.info("HealthCheck: confirm submissions success");

  return {
    ...(submissionsFromConfirmationCodes.submissionsToConfirm.length > 0 && {
      confirmedSubmissions: submissionsFromConfirmationCodes.submissionsToConfirm.map(
        (submission) => submission.confirmationCode
      ),
    }),
    ...(submissionsFromConfirmationCodes.confirmationCodesAlreadyUsed.length > 0 && {
      confirmationCodesAlreadyUsed: submissionsFromConfirmationCodes.confirmationCodesAlreadyUsed,
    }),
    ...(submissionsFromConfirmationCodes.confirmationCodesNotFound.length > 0 && {
      invalidConfirmationCodes: submissionsFromConfirmationCodes.confirmationCodesNotFound,
    }),
    ...(unprocessed.length > 0 && {
      unprocessedConfirmationCodes: unprocessed,
    }),
  };
};

export function vaultStatusFromStatusCreatedAt(statusCreatedAtAttribute: string): VaultStatus {
  const status = statusCreatedAtAttribute.split("#")[0];
  switch (status) {
    case "New":
      return VaultStatus.NEW;
    case "Downloaded":
      return VaultStatus.DOWNLOADED;
    case "Confirmed":
      return VaultStatus.CONFIRMED;
    case "Problem":
      return VaultStatus.PROBLEM;
    default:
      throw new Error(`Unsupported Status#CreatedAt value. Value = ${statusCreatedAtAttribute}.`);
  }
}
