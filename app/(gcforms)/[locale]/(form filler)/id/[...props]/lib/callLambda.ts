import { Responses } from "@lib/types";
import { logMessage } from "@lib/logger";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { SubmissionApiError } from "./exceptions";

export const callLambda = async (
  formID: string,
  fields: Responses,
  language: string,
  securityAttribute: string
) => {
  const encoder = new TextEncoder();

  const command = new InvokeCommand({
    FunctionName: "Submission",
    Payload: encoder.encode(
      JSON.stringify({
        formID,
        language,
        responses: fields,
        securityAttribute,
      })
    ),
  });

  try {
    const response = await lambdaClient.send(command);
    const decoder = new TextDecoder();
    const payload = decoder.decode(response.Payload);
    if (response.FunctionError || !JSON.parse(payload).status) {
      throw new SubmissionApiError("Submission API could not process form response");
    }
  } catch (err) {
    logMessage.error(err as Error);
    throw new SubmissionApiError("Could not process request with Lambda Submission function");
  }
};

const lambdaClient = new LambdaClient({
  region: "ca-central-1",
  retryMode: "standard",
  ...(process.env.LOCAL_AWS_ENDPOINT && { endpoint: process.env.LOCAL_AWS_ENDPOINT }),
});
