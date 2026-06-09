import { BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDBDocumentClient } from "./integration/awsServicesConnector";
import { chunkArray } from "@lib/utils";
import { getExponentialBackoffTimeInMS, delay } from "./utils/retryability";
import { logMessage } from "./logger";
import { VaultSubmissionOverview } from "@lib/types";

export async function enrichOverviewsWithVersionId(
  formID: string,
  accumulatedResponses: VaultSubmissionOverview[]
): Promise<VaultSubmissionOverview[]> {
  if (!accumulatedResponses || accumulatedResponses.length === 0) return accumulatedResponses;

  try {
    const keys = accumulatedResponses.map((r) => ({
      FormID: formID,
      NAME_OR_CONF: `NAME#${r.name}`,
    }));
    const chunkedKeys = chunkArray<{ FormID: string; NAME_OR_CONF: string }>(keys, 50);
    const versionByName = new Map<string, string | null>();

    for (const keysChunk of chunkedKeys) {
      let attempt = 1;
      let remainingKeys = keysChunk;
      while (remainingKeys && remainingKeys.length > 0) {
        const batch = new BatchGetCommand({
          RequestItems: {
            Vault: {
              Keys: remainingKeys,
              ProjectionExpression: "#name,VersionId,NAME_OR_CONF",
              ExpressionAttributeNames: {
                "#name": "Name",
              },
            },
          },
        });

        // eslint-disable-next-line no-await-in-loop
        const batchResp = await dynamoDBDocumentClient.send(batch);

        const items = (batchResp.Responses?.Vault ?? []) as Array<{
          Name?: string;
          VersionId?: string | null;
        }>;
        items.forEach((item) => {
          if (item.Name) versionByName.set(item.Name, item.VersionId ?? null);
        });

        if (batchResp.UnprocessedKeys?.Vault?.Keys) {
          remainingKeys = batchResp.UnprocessedKeys.Vault.Keys as {
            FormID: string;
            NAME_OR_CONF: string;
          }[];
          ++attempt;
          const backOffTime = getExponentialBackoffTimeInMS(100, attempt, 2000, true);
          logMessage.info(
            `Retrying BatchGet for VersionId for form ${formID} attempt ${attempt} in ${backOffTime}ms`
          );
          // eslint-disable-next-line no-await-in-loop
          await delay(backOffTime);
        } else {
          remainingKeys = [] as { FormID: string; NAME_OR_CONF: string }[];
        }
      }
    }

    // Merge VersionId into accumulatedResponses
    accumulatedResponses = accumulatedResponses.map((r) => ({
      ...r,
      versionId: r.versionId ?? versionByName.get(r.name) ?? null,
    }));
  } catch (e) {
    logMessage.warn(`Failed to enrich submissions with VersionId for form ${formID}: ${String(e)}`);
  }

  return accumulatedResponses;
}
