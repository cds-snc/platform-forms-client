import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { delay } from "./utils";

const MAXIMUM_NUMBER_OF_UNPROCESSED_ITEMS_RETRIES = 5;

export async function sendBatchWriteCommandAndRetryOnUnprocessedItemsDetection(
  dynamodbClient: DynamoDBClient,
  command: BatchWriteCommand
): Promise<void> {
  let retries = 0;
  let unprocessed = command.input.RequestItems;

  while (
    unprocessed &&
    Object.keys(unprocessed).length > 0 &&
    retries < MAXIMUM_NUMBER_OF_UNPROCESSED_ITEMS_RETRIES
  ) {
    const response = await dynamodbClient.send(
      new BatchWriteCommand({ RequestItems: unprocessed })
    );

    unprocessed = response.UnprocessedItems;

    if (unprocessed && Object.keys(unprocessed).length > 0) {
      await delay(Math.pow(2, retries) * 100 + Math.floor(Math.random() * 100));
    }

    retries++;
  }

  if (unprocessed && Object.keys(unprocessed).length > 0) {
    throw new Error(
      `Failed to process all BatchWriteCommand items after ${MAXIMUM_NUMBER_OF_UNPROCESSED_ITEMS_RETRIES} retries.`
    );
  }
}
