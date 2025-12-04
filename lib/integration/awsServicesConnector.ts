import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { GetQueueUrlCommand, SQSClient } from "@aws-sdk/client-sqs";
import { S3Client } from "@aws-sdk/client-s3";

const globalConfig = {
  region: process.env.AWS_REGION ?? "ca-central-1",
};

export const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
  ...globalConfig,
  ...(process.env.COGNITO_ACCESS_KEY &&
    process.env.COGNITO_SECRET_KEY && {
      credentials: {
        accessKeyId: process.env.COGNITO_ACCESS_KEY ?? "",
        secretAccessKey: process.env.COGNITO_SECRET_KEY ?? "",
      },
    }),
});

export const dynamoDBDocumentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    ...globalConfig,
    // SDK retries use exponential backoff with jitter by default
    maxAttempts: 15,
  })
);

export const lambdaClient = new LambdaClient({
  ...globalConfig,
  retryMode: "standard",
});

export const sqsClient = new SQSClient({
  ...globalConfig,
});

export const s3Client = new S3Client({
  ...globalConfig,
  ...(process.env.LOCAL_AWS_ENDPOINT && { forcePathStyle: true }),
});

/**
 * Gets the SQS Queue URL from environment variable or if not set fall back to querying AWS SQS.
 *
 * @param urlEnvName - The name of the environment variable containing the queue URL (e.g. "NOTIFICATION_QUEUE_URL")
 * @param urlQueueName - The AWS SQS queue name to look up if the environment variable is not set (e.g. "notification_queue")
 * @returns A promise that resolves to the queue URL string, or null if the queue cannot be found
 * @throws An error if the SQS client fails to retrieve the queue URL
 */
export const getSQSQueueURL = async (
  urlEnvName: string,
  urlQueueName: string
): Promise<string | null> => {
  if (process.env[urlEnvName]) {
    return process.env[urlEnvName];
  }

  const data = await sqsClient.send(
    new GetQueueUrlCommand({
      QueueName: urlQueueName,
    })
  );
  return data.QueueUrl ?? null;
};
