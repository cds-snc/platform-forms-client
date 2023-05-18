import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  CognitoIdentityProviderServiceException,
} from "@aws-sdk/client-cognito-identity-provider";
import { logEvent } from "@lib/auditLogs";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { generateVerificationCode, sendVerificationCode } from "./2fa";

type Credentials = {
  username: string;
  password: string;
};

type CognitoToken = {
  email: string;
  token: string;
};

export const initiateSignIn = async ({
  username,
  password,
}: Credentials): Promise<CognitoToken | null> => {
  if (!username || !password) return null;

  const prismaUser = await prisma.user
    .findUnique({
      where: {
        email: username,
      },
      select: {
        accounts: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  const params: AdminInitiateAuthCommandInput = {
    AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
    ClientId: process.env.COGNITO_APP_CLIENT_ID,
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    AuthParameters: {
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

    const idToken = response.AuthenticationResult?.IdToken;

    if (idToken) {
      const cognitoIDTokenParts = idToken.split(".");
      const claimsBuff = Buffer.from(cognitoIDTokenParts[1], "base64");
      const cognitoIDTokenClaims = JSON.parse(claimsBuff.toString("utf8"));

      return {
        email: cognitoIDTokenClaims.email,
        token: idToken,
      };
    }

    return null;
  } catch (e) {
    if (
      e instanceof CognitoIdentityProviderServiceException &&
      e.name === "NotAuthorizedException" &&
      e.message === "Password attempts exceeded"
    )
      logEvent(
        prismaUser?.accounts[0].id ?? "unknown",
        { type: "User", id: prismaUser?.accounts[0].id ?? "unknown" },
        "UserTooManyFailedAttempts",
        `Password attempts exceeded for ${username}`
      );

    // throw new Error with cognito error converted to string so as to include the exception name
    throw new Error((e as CognitoIdentityProviderServiceException).toString());
  }
};

export const begin2FAAuthentication = async ({ email, token }: CognitoToken): Promise<void> => {
  const verificationCode = await generateVerificationCode();

  const dateIn15Minutes = new Date(Date.now() + 900000); // 15 minutes (= 900000 ms)

  try {
    await prisma.cognitoCustom2FA.create({
      data: {
        email: email,
        cognitoToken: token,
        verificationCode: verificationCode,
        expires: dateIn15Minutes,
      },
    });

    await sendVerificationCode(email, verificationCode);
  } catch (error) {
    // handle error if hitting unique constraint
  }
};

export const requestNew2FAVerificationCode = async (email: string): Promise<void> => {
  const verificationCode = await generateVerificationCode();

  try {
    await prisma.cognitoCustom2FA.update({
      where: {
        email: email,
      },
      data: {
        verificationCode: verificationCode,
      },
    });

    await sendVerificationCode(email, verificationCode);
  } catch (error) {
    // handle error if hitting unique constraint
  }
};
