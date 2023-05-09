import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
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

/**
 * This method returns a list of all form submission records.
 * The list does not contain the acutal submission data, only attributes
 * @param formID - The form ID from which to retrieve responses
 */

export async function listAllSubmissions(
  ability: UserAbility,
  formID: string
): Promise<{ submissions: VaultSubmissionList[]; numberOfUnprocessedSubmissions: number }> {
  // Check access control first
  try {
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
