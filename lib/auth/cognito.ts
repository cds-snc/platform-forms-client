import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  CognitoIdentityProviderServiceException,
} from "@aws-sdk/client-cognito-identity-provider";
import { logEvent } from "@lib/auditLogs";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { generateVerificationCode, sendVerificationCode } from "./2fa";
import { registerFailed2FAAttempt, clear2FALockout } from "./2faLockout";
import { logMessage } from "@lib/logger";

type Credentials = {
  username: string;
  password: string;
};

type CognitoToken = {
  email: string;
  token: string;
};

type DecodedCognitoToken = {
  id: string;
  name: string;
  email: string;
};

export type AuthenticationFlowToken = string;

export enum Validate2FAVerificationCodeResultStatus {
  VALID,
  INVALID,
  EXPIRED,
  LOCKED_OUT,
}

export type Validate2FAVerificationCodeResult = {
  status: Validate2FAVerificationCodeResultStatus;
  decodedCognitoToken?: DecodedCognitoToken;
};

export class Missing2FASession extends Error {}

export const initiateSignIn = async ({
  username,
  password,
}: Credentials): Promise<CognitoToken | null> => {
  const sanitizedUsername = sanitizeEmailAddressForCognito(username);

  const params: AdminInitiateAuthCommandInput = {
    AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
    ClientId: process.env.COGNITO_APP_CLIENT_ID,
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    AuthParameters: {
      USERNAME: sanitizedUsername,
      PASSWORD: password,
    },
  };

  try {
    const cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.COGNITO_REGION,
      ...(process.env.NODE_ENV === "development" && {
        credentials: {
          accessKeyId: process.env.COGNITO_ACCESS_KEY ?? "",
          secretAccessKey: process.env.COGNITO_SECRET_KEY ?? "",
        },
      }),
    });

    const adminInitiateAuthCommand = new AdminInitiateAuthCommand(params);

    const response = await cognitoClient.send(adminInitiateAuthCommand);

    const idToken = response.AuthenticationResult?.IdToken;

    if (idToken) {
      const decodedCognitoToken = decodeCognitoToken(idToken);

      return {
        email: decodedCognitoToken.email,
        token: idToken,
      };
    } else {
      return null;
    }
  } catch (e) {
    if (
      e instanceof CognitoIdentityProviderServiceException &&
      e.name === "NotAuthorizedException" &&
      e.message === "Password attempts exceeded"
    ) {
      const prismaUser = await prisma.user.findUnique({
        where: {
          email: sanitizedUsername,
        },
        select: {
          id: true,
        },
      });

      logEvent(
        prismaUser?.id ?? "unknown",
        { type: "User", id: prismaUser?.id ?? "unknown" },
        "UserTooManyFailedAttempts",
        `Password attempts exceeded for ${sanitizedUsername}`
      );

      logMessage.warn("Cognito Lockout: Password attempts exceeded");
    }

    // throw new Error with cognito error converted to string so as to include the exception name
    throw new Error((e as CognitoIdentityProviderServiceException).toString());
  }
};

export const begin2FAAuthentication = async ({
  email,
  token,
}: CognitoToken): Promise<AuthenticationFlowToken> => {
  // ensure the user account is active

  const sanitizedEmail = sanitizeEmailAddressForCognito(email);

  const prismaUser = await prisma.user.findUnique({
    where: {
      email: sanitizedEmail,
    },
    select: {
      id: true,
      active: true,
    },
  });

  if (prismaUser?.active === false) {
    throw new Error("AccountDeactivated");
  }

  const verificationCode = await generateVerificationCode();

  const dateIn15Minutes = new Date(Date.now() + 900000); // 15 minutes (= 900000 ms)

  try {
    const result = await prisma.cognitoCustom2FA.upsert({
      where: {
        email: sanitizedEmail,
      },
      update: {
        cognitoToken: token,
        verificationCode: verificationCode,
        expires: dateIn15Minutes,
      },
      create: {
        email: sanitizedEmail,
        cognitoToken: token,
        verificationCode: verificationCode,
        expires: dateIn15Minutes,
      },
      select: {
        id: true,
      },
    });

    await clear2FALockout(sanitizedEmail);

    await sendVerificationCode(sanitizedEmail, verificationCode);

    return result.id;
  } catch (error) {
    throw new Error(
      `Failed to generate and send initial verification code. Reason: ${(error as Error).message}.`
    );
  }
};

export const requestNew2FAVerificationCode = async (
  authenticationFlowToken: AuthenticationFlowToken,
  email: string
): Promise<void> => {
  const sanitizedEmail = sanitizeEmailAddressForCognito(email);

  const verificationCode = await generateVerificationCode();

  try {
    const result = await prisma.cognitoCustom2FA
      .update({
        where: {
          id_email: {
            id: authenticationFlowToken,
            email: sanitizedEmail,
          },
        },
        data: {
          verificationCode: verificationCode,
        },
      })
      .catch((e) => prismaErrors(e, null));

    if (result === null) throw new Missing2FASession();

    await sendVerificationCode(sanitizedEmail, verificationCode);
  } catch (error) {
    if (error instanceof Missing2FASession) {
      throw error;
    } else {
      throw new Error(`Failed to send new verification code. Reason: ${(error as Error).message}.`);
    }
  }
};

export const validate2FAVerificationCode = async (
  authenticationFlowToken: AuthenticationFlowToken,
  email: string,
  verificationCode: string
): Promise<Validate2FAVerificationCodeResult> => {
  const sanitizedEmail = sanitizeEmailAddressForCognito(email);

  try {
    const delete2FAVerificationCode = async () => {
      await prisma.cognitoCustom2FA.deleteMany({
        where: {
          email: sanitizedEmail,
        },
      });
    };

    // Verify if the verification code is valid
    const mfaEntry = await prisma.cognitoCustom2FA.findUnique({
      where: {
        id_email: {
          id: authenticationFlowToken,
          email: sanitizedEmail,
        },
      },
    });

    // ensure the user account is active
    const prismaUser = await prisma.user.findUnique({
      where: {
        email: sanitizedEmail,
      },
      select: {
        id: true,
        active: true,
      },
    });

    if (prismaUser?.active === false) {
      await delete2FAVerificationCode();
      throw new Error("AccountDeactivated");
    }

    // If the verification code and username do not match fail the login
    if (mfaEntry === null || mfaEntry.verificationCode !== verificationCode) {
      const lockoutResponse = await registerFailed2FAAttempt(sanitizedEmail);
      if (lockoutResponse.isLockedOut) {
        await delete2FAVerificationCode();
        await clear2FALockout(sanitizedEmail);

        logEvent(
          prismaUser?.id ?? "unknown",
          { type: "User", id: prismaUser?.id ?? "unknown" },
          "UserTooManyFailedAttempts",
          `2FA attempts exceeded for ${sanitizedEmail}`
        );

        logMessage.warn("2FA Lockout: Verification code attempts exceeded");

        return { status: Validate2FAVerificationCodeResultStatus.LOCKED_OUT };
      } else {
        return { status: Validate2FAVerificationCodeResultStatus.INVALID };
      }
    }

    // If the verification code is expired remove it from the database
    if (mfaEntry.expires.getTime() < new Date().getTime()) {
      await delete2FAVerificationCode();
      await clear2FALockout(sanitizedEmail);
      return { status: Validate2FAVerificationCodeResultStatus.EXPIRED };
    }

    // 2FA is valid, remove the verification code from the database and return user info
    await delete2FAVerificationCode();

    await clear2FALockout(sanitizedEmail);

    const decodedCognitoToken = decodeCognitoToken(mfaEntry.cognitoToken);

    return {
      status: Validate2FAVerificationCodeResultStatus.VALID,
      decodedCognitoToken: {
        id: decodedCognitoToken.id,
        name: decodedCognitoToken.name,
        email: decodedCognitoToken.email,
      },
    };
  } catch (error) {
    throw new Error(`Failed to validate verification code. Reason: ${(error as Error).message}.`);
  }
};

/**
 * Since our Cognito user pool is case sensitive we need to sanitize email addresses before we can use them in our requests.
 * The goal is to make them lowercase and to remove any white spaces at the beginning or the end of the address.
 */
export const sanitizeEmailAddressForCognito = (emailAddress: string) => {
  return emailAddress.trim().toLowerCase();
};

const decodeCognitoToken = (token: string): DecodedCognitoToken => {
  const cognitoIDTokenParts = token.split(".");
  const claimsBuff = Buffer.from(cognitoIDTokenParts[1], "base64");
  const cognitoIDTokenClaims = JSON.parse(claimsBuff.toString("utf8"));

  return {
    id: cognitoIDTokenClaims.sub,
    name: cognitoIDTokenClaims.name,
    email: cognitoIDTokenClaims.email,
  };
};
