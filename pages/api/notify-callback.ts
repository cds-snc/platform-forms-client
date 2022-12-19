import { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import { SQSClient, GetQueueUrlCommand, SendMessageCommand } from "@aws-sdk/client-sqs";
import { cors, middleware } from "@lib/middleware";
import { extractBearerTokenFromReq } from "@lib/middleware/validTemporaryToken";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";

const SQS_REPROCESS_SUBMISSION_QUEUE_NAME = "reprocess_submission_queue.fifo";

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

  if (deliveryStatus === "delivered" || deliveryStatus === "permanent-failure") {
    return res.status(200).json({ status: "submission will not be reprocessed" });
  }

  const sqsClient = new SQSClient({
    region: process.env.AWS_REGION ?? "ca-central-1",
    endpoint: process.env.LOCAL_AWS_ENDPOINT,
  });

  try {
    const getQueueURLCommand = new GetQueueUrlCommand({
      QueueName: SQS_REPROCESS_SUBMISSION_QUEUE_NAME,
    });

    const getQueueURLCommandOutput = await sqsClient.send(getQueueURLCommand);

    const sendMessageCommand = new SendMessageCommand({
      MessageBody: JSON.stringify({ submissionID: submissionID }),
      MessageDeduplicationId: submissionID,
      MessageGroupId: "Group-" + submissionID,
      QueueUrl: getQueueURLCommandOutput.QueueUrl,
    });

    await sqsClient.send(sendMessageCommand);

    return res.status(200).json({ status: "submission will be reprocessed" });
  } catch (error) {
    logMessage.warn(error as Error);
    return res.status(500).json({ responses: "Processing error on the server side" });
  }
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
