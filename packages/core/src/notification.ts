import { SendMessageCommand, SQSClient, GetQueueUrlCommand } from "@aws-sdk/client-sqs";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const DYNAMODB_NOTIFICATION_TABLE_NAME = "Notification";

const globalConfig = {
  region: process.env.AWS_REGION ?? "ca-central-1",
};

const sqsClient = new SQSClient({
  ...globalConfig,
});

const dynamoDBDocumentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    ...globalConfig,
    // SDK retries use exponential backoff with jitter by default
    maxAttempts: 15,
  })
);

const getAwsSQSQueueURL = async (
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

/**
 * Creates a notification record in DynamoDB. This record is later used by the
 * notification lambda to send the email once queued by enqueueDeferredNotification.
 *
 * @param notificationId - Unique identifier for the notification
 * @param emails - Array of email addresses to send the notification to
 * @param subject - Email subject line
 * @param body - Email body content
 */
export const createNotificationRecord = async ({
  notificationId,
  emails,
  subject,
  body,
}: {
  notificationId: string;
  emails: string[];
  subject: string;
  body: string;
}): Promise<void> => {
  try {
    const ttl = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
    const command = new PutCommand({
      TableName: DYNAMODB_NOTIFICATION_TABLE_NAME,
      Item: {
        NotificationID: notificationId,
        Emails: emails,
        Subject: subject,
        Body: body,
        TTL: ttl,
      },
    });
    await dynamoDBDocumentClient.send(command);
  } catch (error) {
    throw new Error(
      `Could not create deferred notification id ${notificationId} + ${JSON.stringify(error)}`
    );
  }
};

/**
 * Enques a notification ID in the SQS queue. When dequeued this triggers the
 * notification lambda to process and send the email. The notification record must
 * already exist in DynamoDB (created via createNotificationRecord) before calling
 * this function.
 *
 * @param notificationId - Unique identifier for the notification to enqueue and
 *   used by the notification lambda to look up the record in DynamoDB.
 */
export const enqueueDeferredNotification = async (notificationId: string): Promise<void> => {
  try {
    const queueUrl = await getAwsSQSQueueURL("NOTIFICATION_QUEUE_URL", "notification_queue");
    if (!queueUrl) {
      throw new Error("Notification Queue not connected");
    }

    const command = new SendMessageCommand({
      MessageBody: JSON.stringify({ notificationId }),
      QueueUrl: queueUrl,
    });
    const sendMessageCommandOutput = await sqsClient.send(command);
    if (!sendMessageCommandOutput.MessageId) {
      throw new Error("Received null SQS message identifier");
    }
  } catch (error) {
    throw new Error(
      `Could not enqueue deferred notification id ${notificationId} + ${JSON.stringify(error)}`
    );
  }
};
