import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { SQSClient } from "@aws-sdk/client-sqs";
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
