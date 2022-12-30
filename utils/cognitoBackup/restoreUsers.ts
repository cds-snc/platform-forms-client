import {
  CognitoIdentityProviderClient,
  ConfirmSignUpResponseFilterSensitiveLog,
  CreateUserImportJobCommand,
  StartUserImportJobCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { IAMClient, GetRoleCommand } from "@aws-sdk/client-iam";
import { config } from "dotenv";
import fs from "fs";
import axios from "axios";
import { networkInterfaces } from "os";

// Configurable Variables
const REGION = "ca-central-1";
const USER_POOL_ID = process.argv[2];
const USER_CSV_FILE = process.argv[3] ?? `./user_pool_${USER_POOL_ID}_users.csv`;

if (!USER_POOL_ID) throw new Error("Must supply User Pool ID");

// Cognito Limits
const maxUploadByteSize = 100000000; // max 100mb file size per import job

const getRoleARN = async () => {
  try {
    const iamClient = new IAMClient({ region: REGION });
    const params = {
      RoleName: "role_for_cognito_user_pool_import",
    };
    const data = await iamClient.send(new GetRoleCommand(params));
    if (!data.Role) {
      throw new Error("Could not retrieve ARN for Cloudwatch logging Role");
    }
    console.log(`Sucessfully retrived ARN for ${data.Role?.RoleName}`);
    console.log(`ARN: ${data.Role.Arn}`);
    return data.Role?.Arn;
  } catch (err) {
    console.log("Error", err);
    throw new Error("Could not retrieve ARN for Cloudwatch logging Role");
  }
};

/**
 * Returns the number of milliseconds to be used in an exponential backoff
 * @param  base The base number of milliseconds to wait
 * @param  attempt The number of times the operation has been attempted
 * @param  max The maximum amount of milliseconds to wait
 * @param  withJitter Set to true to add jitter (randomness) to the exponential backoff time that is returned
 * @returns The number of milliseconds to be used in an exponential backoff
 */
const getExponentialBackoffTimeInMS = (
  base: number,
  attempt: number,
  max: number,
  withJitter: boolean = false
): number => {
  const backOffTime = Math.min(max, base * 2 ** attempt);

  if (!withJitter) {
    return backOffTime;
  }

  return 1 + Math.floor(Math.random() * backOffTime); //NOSONAR
};

/**
 * Returns a promise to be used as a sleep function. The values for sleepTimeInSeconds will be added to the value for sleepTimeInMS
 * @param  sleepTimeInSeconds Number of seconds to sleep
 * @param  sleepTimeInMS Number of milliseconds
 * @return  Sleep promise
 */
const sleep = async (sleepTimeInSeconds = 0, sleepTimeInMS = 0) => {
  return new Promise((resolve) => setTimeout(resolve, sleepTimeInMS + sleepTimeInSeconds * 1000));
};

const main = async () => {
  console.log(`Using User Pool ID: ${USER_POOL_ID}`);
  console.log(`Reading users from ${USER_CSV_FILE}`);

  // Read the user CSV file.

  const { size: fileSize } = fs.statSync(USER_CSV_FILE);

  const csvReadStream = fs.createReadStream(USER_CSV_FILE);
  csvReadStream.on("error", console.log);

  // instantiate the cognito client object. cognito is region specific and so a region must be specified
  const cognitoClient = new CognitoIdentityProviderClient({
    region: REGION,
  });

  const createUserImportJobParams = {
    CloudWatchLogsRoleArn: await getRoleARN(),
    UserPoolId: USER_POOL_ID,
    JobName: "cognito-user-import-forms-client",
  };

  console.log("Creating user import job");
  const createUserImportJobCommand = new CreateUserImportJobCommand(createUserImportJobParams);
  const response = await cognitoClient.send(createUserImportJobCommand);

  if (!response.UserImportJob) throw new Error("Job failed to be created");

  console.log(`User import job created`);
  const { JobId, PreSignedUrl } = response.UserImportJob;

  if (!JobId || !PreSignedUrl) throw new Error("User Import Job missing information");

  console.log("Uploading CSV");

  const options = {
    maxBodyLength: maxUploadByteSize,
    maxContentLength: maxUploadByteSize,
    headers: {
      "x-amz-server-side-encryption": "aws:kms",
      "Content-Type": "text/csv",
      "Content-Length": fileSize,
    },
  };

  await axios.put(PreSignedUrl, csvReadStream, options);
  console.log("CSV uploaded");

  let numAttempts = 1;
  let Status;
  const maxAttempts = 5;
  let jobStarted = false;
  while (!jobStarted && numAttempts < maxAttempts) {
    try {
      const startUserImportJobParams = { UserPoolId: USER_POOL_ID, JobId: JobId };
      console.log(`Starting user import job: ${JSON.stringify(startUserImportJobParams)}`);
      const startUserImportJobResponse = await cognitoClient.send(
        new StartUserImportJobCommand({
          UserPoolId: USER_POOL_ID,
          JobId: JobId,
        })
      );
      Status = startUserImportJobResponse.UserImportJob?.Status;
      console.log(`User import job started: ${JobId} (${Status})`);
      jobStarted = true;
    } catch (err) {
      console.error(err);
      const sleepTimeInMs = getExponentialBackoffTimeInMS(100, numAttempts, 10000, false);
      numAttempts++;
      console.log(
        `Sleeping for ${sleepTimeInMs} milliseconds and will attempt to run the user import job again. That will be attempt #${numAttempts}`
      );
      await sleep(0, sleepTimeInMs);
    }
  }
};
// config() adds the AWS credentials to process.env for AWS SDK use
config();
main();
