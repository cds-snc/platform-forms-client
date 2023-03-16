import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Helper function to instantiate DynamoDB and Document client.
 * https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html
 */
export function connectToDynamo(): DynamoDBDocumentClient {
  return DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: process.env.AWS_REGION ?? "ca-central-1",
      ...(process.env.LOCAL_AWS_ENDPOINT && { endpoint: process.env.LOCAL_AWS_ENDPOINT }),
    })
  );
}
