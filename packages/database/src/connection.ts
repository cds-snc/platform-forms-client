import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

let connectionUrl = "";

function getAwsSecret(secretIdentifier: string): Promise<string | undefined> {
  return new SecretsManagerClient()
    .send(new GetSecretValueCommand({ SecretId: secretIdentifier }))
    .then((commandOutput) => commandOutput.SecretString);
}

const connectionString = async () => {
  const envDatabaseUrl = process.env.DATABASE_URL;

  if (!envDatabaseUrl) {
    throw new Error(
      `Missing Database Url Environment Variable, current node env is ${process.env.NODE_ENV}`
    );
  }

  let envConnectionString: string = envDatabaseUrl;

  // If the passed in variable is a secret ARN retrieve the secret
  if (/^arn\:aws\:secretsmanager\:/i.test(envDatabaseUrl)) {
    const secret = await getAwsSecret(envDatabaseUrl);

    if (!secret) {
      throw new Error(
        `Could not retrieve Database Url Secret, current node env is ${process.env.NODE_ENV}`
      );
    }

    envConnectionString = secret;
  }

  connectionUrl = envConnectionString;
};

await connectionString();

export const getConnectionUrl = () => {
  return connectionUrl;
};
