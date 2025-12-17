import { SQSClient, GetQueueUrlCommand } from "@aws-sdk/client-sqs";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const globalConfig = {
  region: process.env.AWS_REGION ?? "ca-central-1",
};

const sqsClient = new SQSClient({
  ...globalConfig,
});

export function getAwsSecret(secretIdentifier: string): Promise<string | undefined> {
  return new SecretsManagerClient()
    .send(new GetSecretValueCommand({ SecretId: secretIdentifier }))
    .then((commandOutput) => commandOutput.SecretString);
}

export const getAwsSQSQueueURL = async (
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
