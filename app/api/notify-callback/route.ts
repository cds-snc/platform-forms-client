import { NextResponse } from "next/server";
import { logMessage } from "@lib/logger";
import { GetQueueUrlCommand, SendMessageCommand } from "@aws-sdk/client-sqs";
import { middleware } from "@lib/middleware";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDBDocumentClient, sqsClient } from "@lib/integration/awsServicesConnector";
import { headers, type UnsafeUnwrappedHeaders } from "next/headers";

const SQS_REPROCESS_SUBMISSION_QUEUE_NAME = "reliability_reprocessing_queue";

let queueUrlRef: string | null = null;

const getQueueURL = async () => {
  if (!queueUrlRef) {
    if (process.env.REPROCESS_SUBMISSION_QUEUE_URL) {
      queueUrlRef = process.env.REPROCESS_SUBMISSION_QUEUE_URL;
    } else {
      const data = await sqsClient.send(
        new GetQueueUrlCommand({
          QueueName: SQS_REPROCESS_SUBMISSION_QUEUE_NAME,
        })
      );
      queueUrlRef = data.QueueUrl ?? null;
    }
  }

  return queueUrlRef;
};

/**
 * Removes the NotifyProcessed identifier that is used to ensure no duplicated submissions
 * @param submissionID
 * @returns void
 */
async function removeProcessedMark(submissionID: string) {
  const updateItem = {
    TableName: "ReliabilityQueue",
    Key: {
      SubmissionID: submissionID,
    },
    UpdateExpression: "SET NotifyProcessed = :processed",
    ExpressionAttributeValues: {
      ":processed": false,
    },
    ReturnValues: "NONE" as const,
  };

  return dynamoDBDocumentClient.send(new UpdateCommand(updateItem));
}

/**
 * Extracts the bearer token from the authorization header
 *
 * @returns The bearer token string
 *
 * @throws
 * This exception is thrown if the bearer token is not found
 */
const extractBearerTokenFromReq = () => {
  const reqHeaders = headers() as unknown as UnsafeUnwrappedHeaders;
  const authHeader = reqHeaders.get("authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7, authHeader.length);
  } else {
    throw new Error("Missing bearer token.");
  }
};

/**
 * This is a middleware function that will validate the bearer token in the authorization header.
 * It is specific to this API as it will be a unique token to ensure calls from GC Notify can be trusted.
 *
 * @param handler - the function to be executed next in the API call
 * @returns either the handler to be executed next in the API call, or updates the res status and returns void
 */
export const validAuthorizationHeader = (): MiddlewareRequest => {
  return async (): Promise<MiddlewareReturn> => {
    try {
      const bearerToken = extractBearerTokenFromReq();
      if (bearerToken !== process.env.GC_NOTIFY_CALLBACK_BEARER_TOKEN) {
        return {
          next: false,
          response: NextResponse.json({ error: "Invalid authorization header" }, { status: 403 }),
        };
      } else {
        return { next: true };
      }
    } catch (error) {
      return {
        next: false,
        response: NextResponse.json({ error: "Missing authorization header" }, { status: 403 }),
      };
    }
  };
};

/**
 * @description
 * Request type: POST
 * USAGE:
 * curl -X POST http://gc-forms/api/notify-callback
 *  -H "Content-Type: application/json"
 *  -H "Authorization: Bearer {token}"
 *  -d '{"id": "fcc82d18-622b-4cea-8843-ac7e28695696", "reference": "1c19ebc1-908c-4997-9d88-31498cd5cd70", "to": "clement.janin@cds-snc.ca", "status": "delivered", "provider_response": "nil", "created_at": "2017-05-14T12:15:30.000000Z", "completed_at": "2017-05-14T12:15:30.000000Z", "sent_at": "2017-05-14T12:15:30.000000Z", "notification_type": "email"}'
 *
 * Using the delivery status from the GC Nofity callback payload it will determine if a submission (reference) has to be reprocessed by the Reliability lambda.
 *
 * https://documentation.notification.canada.ca/en/callbacks.html#message-delivery-receipts
 * @returns
 */
export const POST = middleware([validAuthorizationHeader()], async (req, props) => {
  const submissionID: string = props.body.reference as string;
  const deliveryStatus: string = props.body.status as string;
  const statusDescription: string = props.body.status_description as string;

  if (submissionID === undefined || deliveryStatus === undefined) {
    return NextResponse.json(
      {
        error: "Invalid payload: missing key attributes (reference or status)",
      },
      { status: 400 }
    );
  }

  // When there is no submission ID it means that the email was not a form submission so it can be ignored by our API
  if (submissionID === null) {
    return NextResponse.json({
      status: "submission will not be reprocessed because of missing submission ID",
    });
  }

  if (deliveryStatus === "delivered") {
    logMessage.info("HealthCheck Notify Callback: email delivered, no reprocessing required");
    return NextResponse.json({
      status: "submission will not be reprocessed because the email was delivered",
    });
  }

  if (deliveryStatus === "technical-failure" || deliveryStatus === "permanent-failure") {
    logMessage.warn(
      `HealthCheck Notify Callback: Form submission ${submissionID} will never be delivered because of a ${deliveryStatus} (reason: ${statusDescription})`
    );
    await removeProcessedMark(submissionID);
    return NextResponse.json({
      status: "submission will not be reprocessed because the email will never be delivered",
    });
  }

  try {
    logMessage.info(
      `HealthCheck Notify Callback: Reprocessing submission id ${submissionID} due to notify status of: ${deliveryStatus}`
    );

    // Remove previous process completion identifier
    await removeProcessedMark(submissionID);

    const queueUrl = await getQueueURL();
    if (!queueUrl) throw new Error("Reprocess Submission Queue not connected");

    const sendMessageCommand = new SendMessageCommand({
      MessageBody: JSON.stringify({ submissionID: submissionID }),
      MessageDeduplicationId: submissionID,
      MessageGroupId: "Group-" + submissionID,
      QueueUrl: queueUrl,
    });

    await sqsClient.send(sendMessageCommand);
    return NextResponse.json({ status: "submission will be reprocessed" });
  } catch (error) {
    logMessage.warn(error as Error);
    return NextResponse.json({ responses: "Processing error on the server side" }, { status: 500 });
  }
});
