import { GetQueueUrlCommand, SQSClient } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION ?? "ca-central-1",
});

/**
 * Gets the SQS Queue URL from environment variable or if empty falls back to
 * querying AWS SQS.
 *
 * @param urlEnvName - The name of the environment variable containing the
 *   queue URL (e.g. "NOTIFICATION_QUEUE_URL")
 * @param urlQueueName - The AWS SQS queue name to look up if the environment
 *   variable is not set (e.g. "notification_queue")
 * @returns A promise that resolves to the queue URL string, or null if the
 *   queue cannot be found
 * @throws An error if the SQS client fails to retrieve the queue URL
 */
export const getAwsSQSQueueURL = async (
  urlEnvName: string,
  urlQueueName: string
): Promise<string | null> => {
  if (process.env[urlEnvName]) {
    return process.env[urlEnvName];
  }

  const data = await sqsClient.send(
    new GetQueueUrlCommand({
      QueueName: urlQueueName,
    })
  );
  return data.QueueUrl ?? null;
};
