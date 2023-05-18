import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  CognitoIdentityProviderServiceException,
} from "@aws-sdk/client-cognito-identity-provider";
import { logEvent } from "@lib/auditLogs";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { logMessage } from "./logger";

type Credentials = {
  username: string;
  password: string;
};

export const initiateSignIn = async ({ username, password }: Credentials) => {
  const params: AdminInitiateAuthCommandInput = {
    AuthFlow: "CUSTOM_AUTH",
    ClientId: process.env.COGNITO_APP_CLIENT_ID,
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    AuthParameters: {
      CHALLENGE_NAME: "ADMIN_NO_SRP_AUTH",
      USERNAME: username,
      PASSWORD: password,
    },
  };

  try {
    const cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.COGNITO_REGION,
    });

    const adminInitiateAuthCommand = new AdminInitiateAuthCommand(params);

    const response = await cognitoClient.send(adminInitiateAuthCommand);
    /*
    const idToken = response.AuthenticationResult?.IdToken;
    if (idToken) {
      const cognitoIDTokenParts = idToken.split(".");
      const claimsBuff = Buffer.from(cognitoIDTokenParts[1], "base64");
      const cognitoIDTokenClaims = JSON.parse(claimsBuff.toString("utf8"));
      return {
        id: cognitoIDTokenClaims.sub,
        name: cognitoIDTokenClaims.name,
        email: cognitoIDTokenClaims.email,
      };
    }
    */
    logMessage.debug(response);
    if (response.Session) {
      return { status: "ok", challengeState: "verification_code" };
    }

    return { status: "fail", challengeState: "initial" };
  } catch (e) {
    if (
      e instanceof CognitoIdentityProviderServiceException &&
      e.name === "NotAuthorizedException" &&
      e.message === "Password attempts exceeded"
    ) {
      const prismaUser = await prisma.user
        .findUnique({
          where: {
            email: username,
          },
          select: {
            id: true,
          },
        })
        .catch((e) => prismaErrors(e, null));
      logEvent(
        prismaUser?.id ?? "unknown",
        { type: "User", id: prismaUser?.id ?? "unknown" },
        "UserTooManyFailedAttempts",
        `Password attempts exceeded for ${username}`
      );
    }
    // throw new Error with cognito error converted to string so as to include the exception name
    throw new Error((e as CognitoIdentityProviderServiceException).toString());
  }
};
