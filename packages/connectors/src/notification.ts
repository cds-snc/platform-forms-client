import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { ErrorWithCause } from "./types/errors";
import { getAwsSQSQueueURL } from "./utils";
import { EmailContent } from "./gc-notify-connector";

const DYNAMODB_NOTIFICATION_TABLE_NAME = "Notification";

const globalConfig = {
  region: process.env.AWS_REGION ?? "ca-central-1",
};

const dynamoDBDocumentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    ...globalConfig,
    // SDK retries use exponential backoff with jitter by default
    maxAttempts: 15,
  })
);

const sqsClient = new SQSClient({
  ...globalConfig,
});

let cachedNotificationQueueUrl: string | null = null;

/**
 * Creates a notification record in DynamoDB and enqueues it for immediate sending.
 *
 * @param emails - Array of email addresses to send the notification to
 * @param subject - Email subject line
 * @param body - Email body content
 */
export const sendImmediate = async ({
  emails,
  content,
}: {
  emails: string[];
  content: EmailContent;
}): Promise<void> => {
  const notificationId = randomUUID();

  try {
    await _createRecord({ notificationId, emails, content });
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
 * @param emails - Array of email addresses to send the notification to
 * @param subject - Email subject line
 * @param body - Email body content
 */
export const sendDeferred = async ({
  notificationId,
  emails,
  content,
}: {
  notificationId: string;
  emails: string[];
  content: EmailContent;
}): Promise<void> => {
  try {
    await _createRecord({ notificationId, emails, content });
  } catch (error) {
    throw new ErrorWithCause(`Error creating deferred notification id ${notificationId}`, {
      cause: error,
    });
  }
};

export const enqueueDeferred = async (notificationId: string): Promise<void> => {
  try {
    if (cachedNotificationQueueUrl === null) {
      cachedNotificationQueueUrl = await getAwsSQSQueueURL(
        "NOTIFICATION_QUEUE_URL",
        "notification_queue"
      );
    }

    if (cachedNotificationQueueUrl === null) {
      throw new Error("SQS Notification queue is null");
    }

    const sendMessageCommandOutput = await sqsClient.send(
      new SendMessageCommand({
        MessageBody: JSON.stringify({ notificationId }),
        QueueUrl: cachedNotificationQueueUrl,
      })
    );

    if (sendMessageCommandOutput.MessageId === undefined) {
      throw new Error("Received null SQS message identifier");
    }
  } catch (error) {
    throw new ErrorWithCause(`Could not enqueue`, { cause: error });
  }
};

const _createRecord = async ({
  notificationId,
  emails,
  content,
}: {
  notificationId: string;
  emails: string[];
  content: EmailContent;
}): Promise<void> => {
  try {
    await dynamoDBDocumentClient.send(
      new PutCommand({
        TableName: DYNAMODB_NOTIFICATION_TABLE_NAME,
        Item: {
          NotificationID: notificationId,
          Emails: emails,
          Content: content,
          TTL: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now,
        },
      })
    );
  } catch (error) {
    throw new ErrorWithCause(`Could not create record`, { cause: error });
  }
};
