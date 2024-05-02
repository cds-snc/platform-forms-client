/* eslint-disable no-console */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, ScanCommandOutput, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { config } from "dotenv";

const main = async () => {
  try {
    const dynamodbClient = new DynamoDBClient({
      region: process.env.AWS_REGION ?? "ca-central-1",
      ...(process.env.LOCAL_AWS_ENDPOINT && { endpoint: process.env.LOCAL_AWS_ENDPOINT }),
    });

    let lastEvaluatedKey = null;
    let numberOfReliabilityQueueItems = 0;

    while (lastEvaluatedKey !== undefined) {
      const scanResults: ScanCommandOutput = await dynamodbClient.send(
        new ScanCommand({
          TableName: "ReliabilityQueue",
          ExclusiveStartKey: lastEvaluatedKey ?? undefined,
          Limit: 100, // The upcoming `TransactWriteCommand` operation can only update 100 items per request
          FilterExpression: "attribute_type(#ttl,:type)",
          ProjectionExpression: "SubmissionID,#ttl",
          ExpressionAttributeNames: {
            "#ttl": "TTL",
          },
          ExpressionAttributeValues: {
            ":type": "S",
          },
        })
      );

      if (scanResults.Items && scanResults.Items.length > 0) {
        await dynamodbClient.send(
          new TransactWriteCommand({
            TransactItems: scanResults.Items.map((item) => {
              return {
                Update: {
                  TableName: "ReliabilityQueue",
                  Key: {
                    SubmissionID: item["SubmissionID"],
                  },
                  UpdateExpression: "SET #ttl = :ttlValue",
                  ExpressionAttributeNames: {
                    "#ttl": "TTL",
                  },
                  ExpressionAttributeValues: {
                    ":ttlValue": Number(item["TTL"]),
                  },
                },
              };
            }),
          })
        );

        numberOfReliabilityQueueItems += scanResults.Items.length;

        process.stdout.write(
          `Migration in progress ... ${numberOfReliabilityQueueItems} ReliabilityQueue items have been updated.\r`
        );
      }

      lastEvaluatedKey = scanResults.LastEvaluatedKey;

      // Rate limiting to avoid exceeding provisioned capacity
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(
      `\nMigration completed successfully!\nA total of ${numberOfReliabilityQueueItems} ReliabilityQueue items have been updated and are now compatible with the TTL feature.`
    );
  } catch (error) {
    console.log(error);
  }
};

// config() adds the .env variables to process.env
config();

main();
