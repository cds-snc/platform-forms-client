import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getAwsSQSQueueURL } from "@gcforms/connectors";

const globalConfig = {
  region: process.env.AWS_REGION ?? "ca-central-1",
};

const sqsClient = new SQSClient({
  ...globalConfig,
});

export const dynamoDBDocumentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    ...globalConfig,
    // SDK retries use exponential backoff with jitter by default
    maxAttempts: 15,
  })
);

const DYNAMODB_NOTIFICATION_TABLE_NAME = "Notification";

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

export const enqueueDeferredNotification = async (notificationId: string) => {
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
