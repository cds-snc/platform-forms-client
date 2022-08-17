import { inspect } from "node:util";
import { logMessage } from "@lib/logger";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({
  endpoint: process.env.LOCAL_AWS_ENDPOINT ?? undefined,
  region: process.env.AWS_REGION ?? "ca-central-1",
});

/**
 * Gets a form submission given a form ID and submission ID.  Returns undefined if the submission is not found.
 * @param formId - Form ID to get the submission for.
 * @param submissionId - Submission ID to get the submission for.
 * @returns { Promise<string | undefined> } - The form submission JSON string or undefined if the submission cannot be found.
 */
export async function getFormSubmission(
  formId: string,
  submissionId: string
): Promise<string | undefined> {
  let formSubmission = undefined;

  try {
    const command = new GetItemCommand({
      TableName: "Vault",
      ProjectionExpression: "FormSubmission",
      Key: {
        FormID: { S: formId },
        SubmissionID: { S: submissionId },
      },
    });
    const data = await dynamoDbClient.send(command);
    if (data.Item !== undefined) {
      formSubmission = data.Item.FormSubmission.S;
    }
  } catch (error) {
    logMessage.error(
      `${submissionId}: failed to get form submission with form ID ${formId}: ${inspect(error)}`
    );
  }

  return formSubmission;
}
