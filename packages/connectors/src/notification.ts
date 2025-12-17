import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { ErrorWithCause } from "./types/errors";
import { getAwsSQSQueueURL } from "./utils";

const DYNAMODB_NOTIFICATION_TABLE_NAME = "Notification";

const globalConfig = {
  region: process.env.AWS_REGION ?? "ca-central-1",
};

export const dynamoDBDocumentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    ...globalConfig,
    // SDK retries use exponential backoff with jitter by default
    maxAttempts: 15,
  })
);

export const sqsClient = new SQSClient({
  ...globalConfig,
});

/**
 * Creates a notification record in DynamoDB and enqueues it for immediate sending.
 *
 * @param emails - Array of email addresses to send the notification to
 * @param subject - Email subject line
 * @param body - Email body content
 */
const sendImmediate = async ({
  emails,
  subject,
  body,
}: {
  notificationId?: string;
  emails: string[];
  subject: string;
  body: string;
}): Promise<void> => {
  const notificationId = randomUUID();
  try {
    await _createRecord({ notificationId, emails, subject, body });
    await enqueueDeferred(notificationId);
  } catch (error) {
    throw new ErrorWithCause(`Error creating immediate notification id ${notificationId}`, {
      cause: error,
    });
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
    await _createRecord({ notificationId, emails, subject, body });
  } catch (error) {
    throw new ErrorWithCause(`Error creating deferred notification id ${notificationId}`, {
      cause: error,
    });
  }
};

const _createRecord = async ({
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
    throw new ErrorWithCause(`Could not create record`, { cause: error });
  }
};

const enqueueDeferred = async (notificationId: string): Promise<void> => {
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
    throw new ErrorWithCause(`Could not enqueue`, { cause: error });
  }
};

export const notification = {
  sendImmediate,
  sendDeferred,
  enqueueDeferred,
};
