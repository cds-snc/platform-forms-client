import { Responses } from "@lib/types";
import { InvokeCommand } from "@aws-sdk/client-lambda";
import { SubmissionLambdaInvocationError } from "./exceptions";
import { lambdaClient } from "@lib/integration/awsServicesConnector";
import { logMessage } from "@lib/logger";

export const invokeSubmissionLambda = async (
  formID: string,
  fields: Responses,
  language: string,
  securityAttribute: string
): Promise<string> => {
  try {
    const lambdaInvokeResponse = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: "Submission",
        Payload: JSON.stringify({
          formID,
          language,
          responses: fields,
          securityAttribute,
        }),
      })
    );

    if (lambdaInvokeResponse.StatusCode !== 200 || lambdaInvokeResponse.FunctionError) {
      // If `FunctionError` is defined then the `Payload` is an Error object
      throw new Error(
        `Submission lambda execution failure. Reason: ${lambdaInvokeResponse.Payload?.transformToString()}`
      );
    }

    const lambdaProcessingResult = JSON.parse(
      lambdaInvokeResponse.Payload?.transformToString() ?? "{}"
    ) as { status: boolean; submissionId: string };

    if (lambdaProcessingResult.status === true && lambdaProcessingResult.submissionId) {
      return lambdaProcessingResult.submissionId;
    } else {
      throw new Error(
        `Unexpected Submission lambda processing result: ${lambdaInvokeResponse.Payload?.transformToString()}`
      );
    }
  } catch (error) {
    // Logging error as info for debugging purpose
    logMessage.info(error);
    throw new SubmissionLambdaInvocationError((error as Error).message);
  }
};
