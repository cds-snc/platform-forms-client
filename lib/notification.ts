import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDBDocumentClient, getQueueURL, sqsClient } from "./integration/awsServicesConnector";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { logMessage } from "./logger";

const DYNAMODB_NOTIFICATION_TABLE_NAME = "Notification";

type NotificationParams = {
  notificationId?: string;
  emails: string[];
  subject: string;
  body: string;
};

export const sendImmediatedNotification = async ({
  notificationId,
  emails,
  subject,
  body,
}: NotificationParams): Promise<void> => {
  try {
    await createNotification({ notificationId, emails, subject, body });
    logMessage.info(`Notification created with id ${notificationId}`);

    await queueNotification(notificationId!);
    logMessage.info(`Notification queued with id ${notificationId}`);
  } catch (error) {
    logMessage.error(
      `Sending notification failed with id ${notificationId} and error: ${(error as Error).message}`
    );
    //TODO could bubble error up or keep this as a "fire and forget" method -- throw error;
  }
};

const createNotification = async ({
  notificationId,
  emails,
  subject,
  body,
}: NotificationParams): Promise<void> => {
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
  const result = await dynamoDBDocumentClient.send(command);

  if (result.$metadata.httpStatusCode !== 200) {
    throw new Error(`Failed to create notification with id ${notificationId}`);
  }
};

const queueNotification = async (notificationId: string) => {
  const queueUrl = await getQueueURL("NOTIFICATION_QUEUE_URL", "notification_queue");
  if (!queueUrl) {
    throw new Error("Notification Queue not connected");
  }

  const command = new SendMessageCommand({
    MessageBody: JSON.stringify({ notificationId }),
    QueueUrl: queueUrl,
  });

  const result = await sqsClient.send(command);

  if (result.$metadata.httpStatusCode !== 200) {
    throw new Error(`Failed to queue notification with id ${notificationId}`);
  }
};
