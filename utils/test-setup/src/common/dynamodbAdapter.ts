import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, BatchWriteCommandOutput } from "@aws-sdk/lib-dynamodb";
import pLimit from "p-limit";
import { delay } from "./utils";

const DELAY_BETWEEN_DYNAMODB_QUERIES_IN_MS = 1000; // The delay is needed to avoid being rate limited by DynamoDB's API
const MAXIMUM_NUMBER_OF_UNPROCESSED_ITEMS_RETRIES = 5;

const operationQueue = pLimit(1);

const dynamodbClient = new DynamoDBClient({
  region: "ca-central-1",
  retryMode: "standard",
});

export async function sendBatchWriteCommandAndRetryOnUnprocessedItemsDetection(
  command: BatchWriteCommand
): Promise<void> {
  let retries = 0;
  let unprocessed = command.input.RequestItems;

  while (
    unprocessed &&
    Object.keys(unprocessed).length > 0 &&
    retries < MAXIMUM_NUMBER_OF_UNPROCESSED_ITEMS_RETRIES
  ) {
    const response = await enqueueBatchWriteCommand(
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

async function enqueueBatchWriteCommand(
  command: BatchWriteCommand
): Promise<BatchWriteCommandOutput> {
  return operationQueue(() => {
    return delay(DELAY_BETWEEN_DYNAMODB_QUERIES_IN_MS).then(() => dynamodbClient.send(command));
  });
}
