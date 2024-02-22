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
    let numberOfMigratedAuditLogs = 0;

    while (lastEvaluatedKey !== undefined) {
      const scanResults: ScanCommandOutput = await dynamodbClient.send(
        new ScanCommand({
          TableName: "AuditLogs",
          ExclusiveStartKey: lastEvaluatedKey ?? undefined,
          Limit: 100, // The upcoming `TransactWriteCommand` operation can only update 100 items per request
          FilterExpression: "attribute_not_exists(#status)",
          ProjectionExpression: "UserID,#rangeKey",
          ExpressionAttributeNames: {
            "#status": "Status",
            "#rangeKey": "Event#SubjectID#TimeStamp",
          },
        })
      );

      if (scanResults.Items && scanResults.Items.length > 0) {
        await dynamodbClient.send(
          new TransactWriteCommand({
            TransactItems: scanResults.Items.map((item) => {
              return {
                Update: {
                  TableName: "AuditLogs",
                  Key: {
                    UserID: item["UserID"],
                    ["Event#SubjectID#TimeStamp"]: item["Event#SubjectID#TimeStamp"],
                  },
                  UpdateExpression: "SET #status = :status",
                  ExpressionAttributeNames: {
                    "#status": "Status",
                  },
                  ExpressionAttributeValues: {
                    ":status": "Archivable",
                  },
                },
              };
            }),
          })
        );

        numberOfMigratedAuditLogs += scanResults.Items.length;

        process.stdout.write(
          `Migration in progress ... ${numberOfMigratedAuditLogs} audit logs have been updated.\r`
        );
      }

      lastEvaluatedKey = scanResults.LastEvaluatedKey;

      // Rate limiting to avoid exceeding provisioned capacity
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(
      `\nMigration completed successfully!\nA total of ${numberOfMigratedAuditLogs} audit logs have been updated and are now compatible with the archiver feature.`
    );
  } catch (error) {
    console.log(error);
  }
};

// config() adds the .env variables to process.env
config();

main();
