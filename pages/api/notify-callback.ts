import { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import { SQSClient, GetQueueUrlCommand, SendMessageCommand } from "@aws-sdk/client-sqs";
import { cors, middleware } from "@lib/middleware";
import { extractBearerTokenFromReq } from "@lib/middleware/validTemporaryToken";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { connectToDynamo } from "@lib/integration/dynamodbConnector";
const SQS_REPROCESS_SUBMISSION_QUEUE_NAME = "reprocess_submission_queue.fifo";

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION ?? "ca-central-1",
  endpoint: process.env.LOCAL_AWS_ENDPOINT,
});

const getQueueURL = async () => {
  const data = await sqsClient.send(
    new GetQueueUrlCommand({
      QueueName: SQS_REPROCESS_SUBMISSION_QUEUE_NAME,
    })
  );
  return data.QueueUrl;
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
 * Using the delivery status from the GC Nofity callback payload it will determine if a submission has to be reprocessed by the Reliability lambda.
 *
 * @returns
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const submissionID = req.body.reference;
  const deliveryStatus = req.body.status;

  if (submissionID === undefined || deliveryStatus === undefined) {
    return res
      .status(400)
      .json({ error: "Invalid payload: missing key attributes (reference or status)" });
  }

  // When there is no submission ID it means that the email was not a form submission so it can be ignored by our API
  if (submissionID === null) {
    return res.status(200).json({
      status: "submission will not be reprocessed because of missing submission ID",
    });
  }

  if (deliveryStatus === "delivered") {
    return res
      .status(200)
      .json({ status: "submission will not be reprocessed because the email was delivered" });
  }

  if (deliveryStatus === "permanent-failure") {
    logMessage.warn(
      `Form submission ${submissionID} will never be delivered because of a permanent failure (GC Notify)`
    );
    await removeProcessedMark(submissionID);
    return res.status(200).json({
      status: "submission will not be reprocessed because the email will never be delivered",
    });
  }

  try {
    logMessage.info(
      `Notify Callback: Reprocessing submission id ${submissionID} due to notify status of: ${deliveryStatus}`
    );

    // Remove previous process completion identifier
    await removeProcessedMark(submissionID);

    const reprocessQueueURL = process.env.REPROCESS_SUBMISSION_QUEUE_URL ?? (await getQueueURL());

    const sendMessageCommand = new SendMessageCommand({
      MessageBody: JSON.stringify({ submissionID: submissionID }),
      MessageDeduplicationId: submissionID,
      MessageGroupId: "Group-" + submissionID,
      QueueUrl: reprocessQueueURL,
    });

    await sqsClient.send(sendMessageCommand);

    return res.status(200).json({ status: "submission will be reprocessed" });
  } catch (error) {
    logMessage.warn(error as Error);
    return res.status(500).json({ responses: "Processing error on the server side" });
  }
}

/**
 * Removes the NotifyProcessed identifier that is used to ensure no duplicated submissions
 * @param submissionID
 * @returns void
 */
async function removeProcessedMark(submissionID: string) {
  const documentClient = connectToDynamo();

  const updateItem = {
    TableName: "ReliabilityQueue",
    Key: {
      SubmissionID: submissionID,
    },
    UpdateExpression: "SET NotifyProcessed = :processed",
    ExpressionAttributeValues: {
      ":processed": false,
    },
    ReturnValues: "NONE",
  };

  return await documentClient.send(new UpdateCommand(updateItem));
}

/**
 * This is a middleware function that will validate the bearer token in the authorization header.
 * It is specific to this API as it will be a unique token to ensure calls from GC Notify can be trusted.
 *
 * @param handler - the function to be executed next in the API call
 * @returns either the handler to be executed next in the API call, or updates the res status and returns void
 */
export const validAuthorizationHeader = (): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      const bearerToken = extractBearerTokenFromReq(req);

      if (bearerToken !== process.env.GC_NOTIFY_CALLBACK_BEARER_TOKEN) {
        res.status(403).json({ error: "Invalid authorization header" });
        return { next: false };
      } else {
        return { next: true };
      }
    } catch (error) {
      res.status(403).json({ error: "Missing authorization header" });
      return { next: false };
    }
  };
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), validAuthorizationHeader()],
  handler
);
