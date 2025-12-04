import { PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  dynamoDBDocumentClient,
  getSQSQueueURL,
  sqsClient,
} from "./integration/awsServicesConnector";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { v4 as uuid } from "uuid";
import { logMessage } from "./logger";

const DYNAMODB_NOTIFICATION_TABLE_NAME = "Notification";

interface NotificationOptionalId {
  notificationId?: string;
  emails: string[];
  subject: string;
  body: string;
}

interface NotificationRequiresId {
  notificationId: string;
  emails: string[];
  subject: string;
  body: string;
}

const sendImmediatedNotification = async ({
  notificationId,
  emails,
  subject,
  body,
}: NotificationOptionalId): Promise<void> => {
  const id = notificationId ?? uuid();
  try {
    await _createNotification({ notificationId: id, emails, subject, body });
    await _queueNotification(id!);
    logMessage.info(`Immediate notification created and queued with id ${id}`);
  } catch (error) {
    logMessage.error(
      `Creating immediate notification failed with id ${id} and error: ${(error as Error).message}`
    );
  }
};

const sendDeferredNotification = async ({
  notificationId,
  emails,
  subject,
  body,
}: NotificationRequiresId): Promise<void> => {
  try {
    await _createNotification({ notificationId, emails, subject, body });
    logMessage.info(`Deferred notification created with id ${notificationId}`);
  } catch (error) {
    logMessage.error(
      `Creating deferred notification failed with id ${notificationId} and error: ${
        (error as Error).message
      }`
    );
  }
};

const _createNotification = async ({
  notificationId,
  emails,
  subject,
  body,
}: NotificationRequiresId): Promise<void> => {
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
    throw new Error("Failed to create notification");
  }
};

const _queueNotification = async (notificationId: string) => {
  const queueUrl = await getSQSQueueURL("NOTIFICATION_QUEUE_URL", "notification_queue");
  if (!queueUrl) {
    throw new Error("Notification Queue not connected");
  }
  const command = new SendMessageCommand({
    MessageBody: JSON.stringify({ notificationId }),
    QueueUrl: queueUrl,
  });
  const result = await sqsClient.send(command);
  if (result.$metadata.httpStatusCode !== 200) {
    throw new Error("Failed to queue notification");
  }
};

export const notification = {
  immediate: sendImmediatedNotification,
  deferred: sendDeferredNotification,
};
