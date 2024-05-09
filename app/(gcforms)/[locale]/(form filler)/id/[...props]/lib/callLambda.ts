import { Responses } from "@lib/types";
import { logMessage } from "@lib/logger";
import { InvokeCommand } from "@aws-sdk/client-lambda";
import { SubmissionApiError } from "./exceptions";
import { lambdaClient } from "@lib/integration/awsServicesConnector";

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
