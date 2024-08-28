import { ScanCommand, ScanCommandOutput } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getRedisInstance } from "@lib/integration/redisConnector";
import { logMessage } from "@lib/logger";

export const getOverdueTemplateIds = async (templateIds: string[]): Promise<string[]> => {
  const EXPIRE = 10 * 60; // 10 min -- for testing
  const KEY = "overdue:responses:formIds";

  try {
    const redis = await getRedisInstance();
    const overdue = await redis.get(KEY);

    logMessage.info("OVERDUE overdue");

    if (overdue) {
      const overdueData = JSON.parse(overdue);
      logMessage.info(`OVERDUE cached overdueData: ${overdue}`);
      return filterOverdueTemplateIds(templateIds, overdueData.formIds);
    }

    const overdueData = await fetchOverdueFormIds();

    logMessage.info(`OVERDUE fetched overdueData: ${JSON.stringify(overdueData)}`);

    await redis.setex(KEY, EXPIRE, JSON.stringify(overdueData));

    return filterOverdueTemplateIds(templateIds, overdueData.formIds);
  } catch (e) {
    logMessage.info(`OVERDUE error: ${e.message}`);
    return [];
  }
};

function filterOverdueTemplateIds(templateIds: string[], overdueFormIds: string[]): string[] {
  return templateIds.filter((id) => overdueFormIds.includes(id));
}

async function retrieveNewOrDownloadedFormResponsesOver28DaysOld() {
  try {
    const dynamodbClient = new DynamoDBClient({
      region: process.env.AWS_REGION ?? "ca-central-1",
      ...(process.env.LOCAL_AWS_ENDPOINT && { endpoint: process.env.LOCAL_AWS_ENDPOINT }),
    });

    let formResponses: { formID: string; createdAt: number }[] = [];
    let lastEvaluatedKey = null;

    // 5 min
    const TIME_AGO = 5 * 60 * 1000; // for testing

    while (lastEvaluatedKey !== undefined) {
      // eslint-disable-next-line no-await-in-loop
      const scanResults: ScanCommandOutput = await dynamodbClient.send(
        new ScanCommand({
          TableName: "Vault",
          ExclusiveStartKey: lastEvaluatedKey ?? undefined,
          FilterExpression:
            "(#status = :statusNew OR #status = :statusDownloaded) AND CreatedAt <= :createdAt",
          ProjectionExpression: "FormID,CreatedAt",
          ExpressionAttributeNames: {
            "#status": "Status",
          },
          ExpressionAttributeValues: {
            ":statusNew": "New",
            ":statusDownloaded": "Downloaded",
            ":createdAt": Date.now() - TIME_AGO,
          },
        })
      );

      formResponses = formResponses.concat(
        scanResults.Items?.map((item) => ({
          formID: item.FormID,
          createdAt: item.CreatedAt,
        })) ?? []
      );

      lastEvaluatedKey = scanResults.LastEvaluatedKey;
    }

    return formResponses;
  } catch (error) {
    throw new Error(
      `Failed to retrieve new or downloaded form responses. Reason: ${(error as Error).message}.`
    );
  }
}

async function fetchOverdueFormIds(): Promise<{ formIds: string[] }> {
  const formResponses = await retrieveNewOrDownloadedFormResponsesOver28DaysOld();

  const reduceResult = formResponses.reduce((acc, curr) => {
    const { formID, createdAt } = curr;

    const previousEntry = acc[formID];

    if (previousEntry && previousEntry?.createdAt < createdAt) {
      return acc;
    } else {
      acc[formID] = curr;
      return acc;
    }
  }, {} as { [key: string]: { formID: string; createdAt: number } });

  return { formIds: Object.values(reduceResult).map((entry) => entry.formID) };
}
