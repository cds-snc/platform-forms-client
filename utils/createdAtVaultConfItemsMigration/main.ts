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
    let numberOfUpdatedVaultConfItems = 0;

    while (lastEvaluatedKey !== undefined) {
      const scanResults: ScanCommandOutput = await dynamodbClient.send(
        new ScanCommand({
          TableName: "Vault",
          ExclusiveStartKey: lastEvaluatedKey ?? undefined,
          Limit: 100, // The next `TransactWriteCommand` operation we gonna run can only update 100 items per request
          FilterExpression: "begins_with(NAME_OR_CONF, :nameOrConfPrefix)",
          ExpressionAttributeValues: {
            ":nameOrConfPrefix": "NAME#",
          },
          ProjectionExpression: "FormID,ConfirmationCode,CreatedAt",
        })
      );

      if (scanResults.Items && scanResults.Items.length > 0) {
        await dynamodbClient.send(
          new TransactWriteCommand({
            TransactItems: scanResults.Items.map((item) => {
              return {
                Update: {
                  TableName: "Vault",
                  Key: {
                    FormID: item["FormID"],
                    NAME_OR_CONF: `CONF#${item["ConfirmationCode"]}`,
                  },
                  UpdateExpression: "SET CreatedAt = :createdAtValue",
                  ExpressionAttributeValues: {
                    ":createdAtValue": item["CreatedAt"],
                  },
                },
              };
            }),
          })
        );

        numberOfUpdatedVaultConfItems += scanResults.Items.length;

        process.stdout.write(
          `Migration in progress ... ${numberOfUpdatedVaultConfItems} Vault CONF# items have been updated.\r`
        );
      }

      lastEvaluatedKey = scanResults.LastEvaluatedKey;

      // Rate limiting to avoid exceeding provisioned capacity
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(
      `\nMigration completed successfully!\nA total of ${numberOfUpdatedVaultConfItems} Vault CONF# items have been updated and now include a CreatedAt property.`
    );
  } catch (error) {
    console.log(error);
  }
};

// config() adds the .env variables to process.env
config();

main();
