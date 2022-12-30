import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandOutput,
  UserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { createObjectCsvWriter } from "csv-writer";
import { config } from "dotenv";

// Configurable Variables
const COGNITO_REGION = "ca-central-1";
const USER_POOL_ID = process.argv[2];

if (!USER_POOL_ID) throw new Error("Must supply User Pool ID");

interface UserAttributes {
  [key: string]: string | undefined;
}

const CSV_HEADERS = [
  "name",
  "given_name",
  "family_name",
  "middle_name",
  "nickname",
  "preferred_username",
  "profile",
  "picture",
  "website",
  "email",
  "email_verified",
  "gender",
  "birthdate",
  "zoneinfo",
  "locale",
  "phone_number",
  "phone_number_verified",
  "address",
  "updated_at",
  "cognito:mfa_enabled",
  "cognito:username",
];

async function saveUsers(users: Array<UserType>) {
  const userAttributes = Object.keys(users[0]);
  const csvWriter = createObjectCsvWriter({
    path: `user_pool_${USER_POOL_ID}_users.csv`,
    header: CSV_HEADERS.map((header) => ({ id: header, title: header })),
  });

  await csvWriter.writeRecords(
    users.map((user) => {
      const userAttributes: UserAttributes = {};

      if (user.Attributes) {
        for (const attribute of user.Attributes) {
          if (attribute.Name) {
            userAttributes[attribute.Name] = attribute.Value;
          }
        }
      }

      return {
        name: userAttributes.name,
        email: userAttributes.email,
        email_verified: userAttributes.email_verified,
        phone_number: userAttributes.phone_number,
        phone_number_verified: userAttributes.phone_number_verified ?? "false",
        "cognito:username": userAttributes.email,
        "cognito:mfa_enabled": user.MFAOptions ? "true" : "false",
      };
    })
  );
}

const main = async () => {
  console.log(`Using User Pool ID: ${USER_POOL_ID}`);

  // instantiate the cognito client object. cognito is region specific and so a region must be specified
  const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
  });

  let paginationToken = undefined;
  let paginationComplete = false;
  let paginationRound = 0;

  while (!paginationComplete) {
    const data: ListUsersCommandOutput = await cognitoClient.send(
      new ListUsersCommand({
        UserPoolId: USER_POOL_ID,
        ...(paginationToken !== undefined && { PaginationToken: paginationToken }),
      })
    );

    paginationToken = data.PaginationToken;
    paginationRound += 1;

    // If no pagination token is provided all users have been retrieved
    if (typeof data.PaginationToken === "undefined") {
      paginationComplete = true;
    }

    if (data.Users) {
      console.log(`Saving ${data.Users.length} users in downloaded batch ${paginationRound}`);
      saveUsers(data.Users);
    }
  }
};
// config() adds the AWS credentials to process.env for AWS SDK use
config();
main();
