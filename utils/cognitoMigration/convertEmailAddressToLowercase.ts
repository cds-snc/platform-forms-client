import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandOutput,
  UserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { config } from "dotenv";

// Configurable Variables
const COGNITO_REGION = "ca-central-1";
const USER_POOL_ID = process.argv[2];

interface UserAttributes {
  [key: string]: string | undefined;
}

if (!USER_POOL_ID) throw new Error("Must supply User Pool ID");

const main = async () => {
  console.log(`Using User Pool ID: ${USER_POOL_ID}`);

  // instantiate the cognito client object. cognito is region specific and so a region must be specified
  const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
  });

  const users = await retrieveUsers(cognitoClient);
  
  const usersToUpdate = users.map((user) => {
    const userAttributes: UserAttributes = {};
  
    if (user.Attributes) {
      for (const attribute of user.Attributes) {
        if (attribute.Name) {
          userAttributes[attribute.Name] = attribute.Value;
        }
      }
    }
  
    return {
      username: user.Username,
      email: userAttributes.email,
    };
  }).filter((user) => {
    if (user.username && user.email) return /[A-Z]/.test(user.email);
    else return false;
  }) as { username: string, email: string }[];

  console.log("Users requiring email address update:")
  console.log(usersToUpdate);

  for (const user of usersToUpdate) {
    await cognitoClient.send(new AdminUpdateUserAttributesCommand({
      UserPoolId: USER_POOL_ID,
      Username: user.username,
      UserAttributes: [
        {
          Name: "email",
          Value: user.email.toLowerCase(),
        },
        {
          Name: "email_verified",
          Value: "true",
        }
      ]
    }));

    console.log(`Converted email address ${user.email} to ${user.email.toLowerCase()} for user ${user.username}.`);
  }
};

const retrieveUsers = async (cognitoClient: CognitoIdentityProviderClient) => {
  let paginationToken: string | undefined = undefined;
  let paginationComplete = false;
  let paginationRound = 0;

  let users: UserType[] = [];

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
      console.log(`Retrieved ${data.Users.length} users in batch ${paginationRound}`);
      users = users.concat(data.Users);
    }
  }

  return users;
};

// config() adds the AWS credentials to process.env for AWS SDK use
config();
main();
