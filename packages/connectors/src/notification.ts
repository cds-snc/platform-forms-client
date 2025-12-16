import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { dynamoDBDocumentClient, getAwsSQSQueueURL, sqsClient } from "./utils";

const DYNAMODB_NOTIFICATION_TABLE_NAME = "Notification";

/**
 * Creates a notification record in DynamoDB and enqueues it for immediate sending.
 *
 * @param notificationId - Unique identifier for the notification
 * @param emails - Array of email addresses to send the notification to
 * @param subject - Email subject line
 * @param body - Email body content
 */
const sendImmediate = async ({
  notificationId,
  emails,
  subject,
  body,
}: {
  notificationId?: string;
  emails: string[];
  subject: string;
  body: string;
}): Promise<void> => {
  const id = notificationId ?? randomUUID();
  try {
    await _createNotificationRecord({ notificationId: id, emails, subject, body });
    await _enqueueDeferredNotification(id!);
  } catch (error) {
    throw new Error(`Error creating immediate notification id ${id}`, { cause: error });
  }
};

/**
 * Creates a notification record in DynamoDB for deferred sending. Once the related
 * process is completed it can enqueue the notification for sending by calling
 * enqueueDeferredNotification with the related notificationId.
 *
 * @param notificationId - Unique identifier for the notification to enqueue and
 *   used by the notification lambda to look up the record in DynamoDB.
 */
const sendDeferred = async ({
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
    await _createNotificationRecord({ notificationId, emails, subject, body });
  } catch (error) {
    throw new Error(`Error creating deferred notification id ${notificationId}`, { cause: error });
  }
};

const _createNotificationRecord = async ({
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
    throw new Error(`Could not create record`, { cause: error });
  }
};

const _enqueueDeferredNotification = async (notificationId: string): Promise<void> => {
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
    throw new Error(`Could not enqueue`, { cause: error });
  }
};

export const notification = {
  sendImmediate,
  sendDeferred,
  enqueueDeferredNotification: _enqueueDeferredNotification,
};
