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
import { serverTranslation } from "@i18n";

if (
  (!process.env.COGNITO_APP_CLIENT_ID ||
    !process.env.COGNITO_REGION ||
    !process.env.COGNITO_USER_POOL_ID) &&
  process.env.APP_ENV !== "test"
)
  throw new Error("Missing Cognito Credentials");

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

export type Validate2FAVerificationCodeResult = {
  valid: boolean;
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
      ...((process.env.NODE_ENV === "development" ||
        process.env.HOST_URL === "http://localhost:3000") && {
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

    throw e;
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
): Promise<string> => {
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
    return verificationCode;
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
    // Verify if the verification code is valid
    const mfaEntry = await prisma.cognitoCustom2FA.findUnique({
      where: {
        id_email: {
          id: authenticationFlowToken,
          email: sanitizedEmail,
        },
      },
    });

    const prismaUser = await prisma.user.findUnique({
      where: {
        email: sanitizedEmail,
      },
      select: {
        id: true,
      },
    });

    // If the verification code and username do not match fail the login
    if (mfaEntry === null || mfaEntry.verificationCode !== verificationCode) {
      const lockoutResponse = await registerFailed2FAAttempt(sanitizedEmail);
      if (lockoutResponse.isLockedOut) {
        await delete2FAVerificationCode(sanitizedEmail);
        await clear2FALockout(sanitizedEmail);

        logEvent(
          prismaUser?.id ?? "unknown",
          { type: "User", id: prismaUser?.id ?? "unknown" },
          "UserTooManyFailedAttempts",
          `2FA attempts exceeded for ${sanitizedEmail}`
        );

        logMessage.warn("2FA Lockout: Verification code attempts exceeded");
      }
      return { valid: false };
    }

    // If the verification code is expired remove it from the database
    if (mfaEntry.expires.getTime() < new Date().getTime()) {
      await delete2FAVerificationCode(sanitizedEmail);
      await clear2FALockout(sanitizedEmail);
      return { valid: false };
    }

    // 2FA is valid, remove the verification code from the database and return user info
    await delete2FAVerificationCode(sanitizedEmail);

    await clear2FALockout(sanitizedEmail);

    const decodedCognitoToken = decodeCognitoToken(mfaEntry.cognitoToken);

    return {
      valid: true,
      decodedCognitoToken: {
        id: decodedCognitoToken.id,
        name: decodedCognitoToken.name,
        email: decodedCognitoToken.email,
      },
    };
  } catch (error) {
    logMessage.warn(`Failed to validate verification code. Reason: ${(error as Error).message}.`);
    return {
      valid: false,
    };
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
/**
 * Remove the 2FA verification code from the database
 * @param email
 */
const delete2FAVerificationCode = async (email: string) => {
  await prisma.cognitoCustom2FA.deleteMany({
    where: {
      email,
    },
  });
};

export async function handleErrorById(id: string, language: string) {
  const { t } = await serverTranslation("cognito-errors", { lang: language });
  const errorObj: {
    title: string;
    description?: string;
    callToActionText?: string;
    callToActionLink?: string;
  } = { title: t("InternalServiceException") };
  switch (id) {
    // Custom and specific message. Would a more generic message be better?
    case "InternalServiceExceptionLogin":
      errorObj.title = t("InternalServiceExceptionLogin.title");
      errorObj.description = t("InternalServiceExceptionLogin.description");
      errorObj.callToActionText = t("InternalServiceExceptionLogin.linkText");
      errorObj.callToActionLink = t("InternalServiceExceptionLogin.link");
      break;
    case "UsernameOrPasswordIncorrect":
    case "UserNotFoundException":
    case "NotAuthorizedException":
      errorObj.title = t("UsernameOrPasswordIncorrect.title");
      errorObj.description = t("UsernameOrPasswordIncorrect.description");
      errorObj.callToActionLink = t("UsernameOrPasswordIncorrect.link");
      errorObj.callToActionText = t("UsernameOrPasswordIncorrect.linkText");
      break;
    case "UsernameExistsException":
      errorObj.title = t("UsernameExistsException"); // TODO ask design/content for error message
      break;
    case "IncorrectSecurityAnswerException":
      errorObj.title = t("IncorrectSecurityAnswerException.title");
      errorObj.description = t("IncorrectSecurityAnswerException.description");
      break;
    case "2FAInvalidVerificationCode":
    case "CodeMismatchException":
      errorObj.title = t("CodeMismatchException"); // TODO ask design/content for error message
      break;
    case "ExpiredCodeException":
    case "2FAExpiredSession":
      errorObj.title = t("ExpiredCodeException"); // TODO ask design/content for error message
      break;
    case "TooManyRequestsException":
      errorObj.title = t("TooManyRequestsException.title");
      errorObj.description = t("TooManyRequestsException.description");
      errorObj.callToActionLink = t("TooManyRequestsException.link");
      errorObj.callToActionText = t("TooManyRequestsException.linkText");
      break;
    default:
      errorObj.title = t("InternalServiceException"); // TODO ask design/content for error message
  }

  return errorObj;
}
