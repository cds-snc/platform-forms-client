import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDBDocumentClient, sqsClient } from "./integration/awsServicesConnector";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { logMessage } from "./logger";

// TODO: Should these instead be pulled from environment variables?
const DYNAMODB_NOTIFICATION_TABLE_NAME = "Notification";
const SQS_NOTIFICATION_QUEUE_URL = "notification_queue"; // or even the method from auditLogs.ts getQueueURL()

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
}: NotificationParams) => {
  try {
    const resultCreated = await createNotification({
      notificationId,
      emails,
      subject,
      body,
    });
    if (resultCreated.$metadata.httpStatusCode !== 200) {
      throw new Error(`Failed to create notification with id ${notificationId}`);
    }
    // TEMP
    // console.log("Notification created", resultCreated);

    const resultQueued = await queueNotification(notificationId!);
    if (resultQueued.$metadata.httpStatusCode !== 200) {
      throw new Error(`Failed to queue notification with id ${notificationId}`);
    }
    // TEMP
    // console.log("Notification queued", resultQueued);
  } catch (error) {
    logMessage.error(
      `Sending notification failed with id ${notificationId} and error: ${(error as Error).message}`
    );
  }
};

const createNotification = async ({
  notificationId,
  emails,
  subject,
  body,
}: NotificationParams) => {
  const ttl = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
  const updateItem = {
    TableName: DYNAMODB_NOTIFICATION_TABLE_NAME,
    Item: {
      NotificationID: notificationId,
      Emails: emails,
      Subject: subject,
      Body: body,
      TTL: ttl,
    },
  };
  return dynamoDBDocumentClient.send(new PutCommand(updateItem));
};

const queueNotification = async (notificationId: string) => {
  const notificationMessage = JSON.stringify({
    notificationId,
  });
  return sqsClient.send(
    new SendMessageCommand({
      MessageBody: notificationMessage,
      QueueUrl: SQS_NOTIFICATION_QUEUE_URL,
    })
  );
};
