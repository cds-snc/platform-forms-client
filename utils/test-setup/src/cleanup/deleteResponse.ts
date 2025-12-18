import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { chunkArray } from "../common/utils";
import { LimitFunction } from "p-limit";
import { sendBatchWriteCommandAndRetryOnUnprocessedItemsDetection } from "../common/dynamodbAdapter";
import { dynamodbOperationQueue } from "../common/operationQueues";

interface Response {
  formId: string;
  name: string;
  confirmationCode: string;
  submissionAttachments: string | undefined;
}

const dynamodbClient = new DynamoDBClient({
  region: "ca-central-1",
  retryMode: "standard",
});

export async function deleteResponses(formId: string): Promise<void> {
  let lastEvaluatedKey = null;

  while (lastEvaluatedKey !== undefined) {
    const responsesToDelete = await retrieveResponsesToDeleteFromDynamodb(
      dynamodbOperationQueue,
      formId,
      lastEvaluatedKey ?? undefined
    );

    await deleteResponsesFromDynamodb(dynamodbOperationQueue, responsesToDelete.responses);

    lastEvaluatedKey = responsesToDelete.lastEvaluatedKey;
  }
}

async function retrieveResponsesToDeleteFromDynamodb(
  operationQueue: LimitFunction,
  formId: string,
  lastEvaluatedKey?: Record<string, any>
): Promise<{ responses: Response[]; lastEvaluatedKey?: Record<string, any> }> {
  return operationQueue(() => {
    return dynamodbClient
      .send(
        new QueryCommand({
          TableName: "Vault",
          Limit: 50, // We set the limit to 50 because we will need to delete 2 items per response in the next `deleteResponsesFromDynamodb` operation. This is done to comply with DynamoDB's API rate limiting.
          ExclusiveStartKey: lastEvaluatedKey,
          KeyConditionExpression:
            "FormID = :formId AND begins_with(NAME_OR_CONF, :nameOrConfPrefix)",
          ProjectionExpression: "FormID,#name,ConfirmationCode,SubmissionAttachments",
          ExpressionAttributeNames: {
            "#name": "Name",
          },
          ExpressionAttributeValues: {
            ":formId": formId,
            ":nameOrConfPrefix": "NAME#",
          },
        })
      )
      .then((response) => {
        return {
          responses:
            response.Items?.map((item) => ({
              formId: item.FormID,
              name: item.Name,
              confirmationCode: item.ConfirmationCode,
              submissionAttachments: item.SubmissionAttachments,
            })) ?? [],
          lastEvaluatedKey: response.LastEvaluatedKey,
        };
      });
  });
}

async function deleteResponsesFromDynamodb(
  operationQueue: LimitFunction,
  responses: Response[]
): Promise<void> {
  // We have to create smaller chunks because we need to delete 2 items (response + confirmation) per response and we are limited by the BatchWriteItemCommand which can only delete 25 elements at a time
  const deleteResponseOperations = chunkArray(responses, 12)
    .map((chunk) => {
      return new BatchWriteCommand({
        RequestItems: {
          Vault: chunk.flatMap((response) => {
            return [
              {
                DeleteRequest: {
                  Key: {
                    FormID: response.formId,
                    NAME_OR_CONF: `NAME#${response.name}`,
                  },
                },
              },
              {
                DeleteRequest: {
                  Key: {
                    FormID: response.formId,
                    NAME_OR_CONF: `CONF#${response.confirmationCode}`,
                  },
                },
              },
            ];
          }),
        },
      });
    })
    .map((deleteCommand) => {
      return operationQueue(() => {
        return sendBatchWriteCommandAndRetryOnUnprocessedItemsDetection(
          dynamodbClient,
          deleteCommand
        ).catch((error) => {
          console.log(error);
          throw new Error(`Failed to delete responses. Reason: ${(error as Error).message}.`);
        });
      });
    });

  await Promise.all(deleteResponseOperations);
}
