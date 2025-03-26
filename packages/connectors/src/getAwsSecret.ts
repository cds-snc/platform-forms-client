import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

export function getAwsSecret(secretIdentifier: string): Promise<string | undefined> {
  return new SecretsManagerClient()
    .send(new GetSecretValueCommand({ SecretId: secretIdentifier }))
    .then((commandOutput) => commandOutput.SecretString);
}
