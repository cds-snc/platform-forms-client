"use server";
import * as v from "valibot";
import { serverTranslation } from "@i18n";
import { redirect } from "next/navigation";
import { requestNew2FAVerificationCode, auth } from "@lib/auth";
import { signIn } from "@lib/auth";
import { handleErrorById } from "@lib/auth/cognito";
import { cookies } from "next/headers";
import { prisma } from "@lib/integration/prismaConnector";
import { AuthError } from "next-auth";
import { createAbility } from "@lib/privileges";
import { getUnprocessedSubmissionsForUser } from "@lib/users";
import { logMessage } from "@lib/logger";

export interface ErrorStates {
  authError?: {
    id: string;
    title?: string;
    description?: string;
    callToActionText?: string;
    callToActionLink?: string;
  };
  validationErrors?: {
    fieldKey: string;
    fieldValue: string;
  }[];
  success?: boolean;
}

const validate = async (
  language: string,
  formEntries: {
    [k: string]: FormDataEntryValue;
  }
) => {
  const { t } = await serverTranslation(["auth-verify"], { lang: language });

  const formValidationSchema = v.object({
    verificationCode: v.string([
      v.minLength(1, t("verify.fields.confirmationCode.error.notEmpty")),
      v.length(5, t("verify.fields.confirmationCode.error.length")),
      v.regex(/^[a-z0-9]*$/i, t("verify.fields.confirmationCode.error.noSymbols")),
    ]),
    authenticationFlowToken: v.string([v.minLength(1)]),
    email: v.string([v.toTrimmed(), v.toLowerCase(), v.minLength(1)]),
  });
  return v.safeParse(formValidationSchema, formEntries, { abortPipeEarly: true });
};

const isUserActive = async (email: string) => {
  // Check if user is active and is allowed to sign in
  const prismaUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      id: true,
      active: true,
    },
  });

  if (prismaUser === null) {
    // The user is logging in for the first time and doesn't yet exist in the db
    return true;
  }
  return prismaUser.active;
};

const isUserLockedOut = async (email: string) => {
  const userInAuthFlow = await prisma.cognitoCustom2FA.exists({
    email: email,
  });
  return !userInAuthFlow;
};

export const verify = async (
  language: string,
  _: ErrorStates,
  formData: FormData
): Promise<ErrorStates> => {
  const rawFormData = Object.fromEntries(formData.entries());

  const valid = await validate(language, rawFormData);

  if (!valid.success) {
    return {
      validationErrors: valid.issues.map((issue) => ({
        fieldKey: issue.path?.[0].key as string,
        fieldValue: issue.message,
      })),
      success: false,
    };
  }

  const { email, authenticationFlowToken, verificationCode } = valid.output;

  // If the cookie exists but the token does not exist in the database, the user is locked out
  if (await isUserLockedOut(email)) {
    return {
      success: false,
      authError: {
        id: "2FALockedOutSession",
      },
    };
  }

  // Will redirect if user account is not active
  if (!(await isUserActive(email))) {
    redirect(`/${language}/auth/account-deactivated`);
  }

  // A failed login will always return an error
  try {
    await signIn("mfa", {
      username: email,
      verificationCode,
      authenticationFlowToken,
      redirect: false,
    });
  } catch (err) {
    // Failed login attempt
    if ((err as AuthError).name === "CredentialsSignin") {
      return {
        success: false,
        authError: {
          id: "2FAInvalidVerificationCode",
          ...(await handleErrorById("2FAInvalidVerificationCode", language)),
        },
      };
    }

    return {
      success: false,
      authError: {
        id: "InternalNextAuthError",
        ...(await handleErrorById("InternalNextAuthError", language)),
      },
    };
  }

  return {
    success: true,
  };
};

export const resendVerificationCode = async (
  language: string,
  email: string,
  authenticationFlowToken: string
): Promise<void> => {
  const newCode = await requestNew2FAVerificationCode(authenticationFlowToken, email);
  cookies().set(
    "authenticationFlow",
    JSON.stringify({
      authenticationFlowToken: newCode,
      email,
    }),
    { secure: true, sameSite: "strict", maxAge: 60 * 15 }
  );

  redirect(`/${language}/auth/mfa`);
};

export const getErrorText = async (language: string, errorID: string) => {
  return handleErrorById(errorID, language);
};

export const getRedirectPath = async (locale: string) => {
  const session = await auth();

  if (!session) {
    // The sessions between client and server are not in sync.
    // Try to redirect to auth policy page and let logic handle there.
    return { callback: `/${locale}/auth/policy` };
  }

  if (session.user.newlyRegistered || !session.user.hasSecurityQuestions) {
    return { callback: `/${locale}/auth/setup-security-questions` };
  }

  const ability = createAbility(session);

  // Get user
  const user = session.user;

  const overdue = await getUnprocessedSubmissionsForUser(ability, user.id).catch((err) => {
    logMessage.warn(`Error getting unprocessed submissions for user ${user.id}: ${err.message}`);
    // Fail gracefully if we can't get the unprocessed submissions.
    return { callback: `/${locale}/auth/policy` };
  });

  let hasOverdueSubmissions = false;

  Object.entries(overdue).forEach(([, value]) => {
    if (value.level > 2) {
      hasOverdueSubmissions = true;
      return;
    }
  });

  if (hasOverdueSubmissions) {
    return { callback: `/${locale}/auth/restricted-access` };
  }

  return { callback: `/${locale}/auth/policy` };
};
