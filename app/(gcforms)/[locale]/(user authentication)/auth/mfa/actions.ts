"use server";

import * as v from "valibot";
import { serverTranslation } from "@i18n";
import { redirect } from "next/navigation";
import { requestNew2FAVerificationCode } from "@lib/auth";
import { signIn } from "@lib/auth";
import { handleErrorById, Missing2FASession } from "@lib/auth/cognito";
import { cookies } from "next/headers";
import { prisma } from "@lib/integration/prismaConnector";
import { CredentialsSignin } from "next-auth";
import { getUnprocessedSubmissionsForUser } from "@lib/users";
import { logMessage } from "@lib/logger";
import { revalidatePath } from "next/cache";
import { AuthenticatedAction } from "@lib/actions";

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

// Public facing functions - they can be used by anyone who finds the associated server action identifer

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
    if (err instanceof CredentialsSignin) {
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
  // Ensure all components get new Session data
  revalidatePath("/", "layout");
  return {
    success: true,
  };
};

export const resendVerificationCode = async (
  language: string,
  email: string,
  authenticationFlowToken: string
): Promise<void | { error: string }> => {
  try {
    const newCode = await requestNew2FAVerificationCode(authenticationFlowToken, email);
    (await cookies()).set(
      "authenticationFlow",
      JSON.stringify({
        authenticationFlowToken: newCode,
        email,
      }),
      { secure: true, sameSite: "strict", maxAge: 60 * 15 }
    );
  } catch (err) {
    if (err instanceof Missing2FASession) {
      redirect(`/${language}/auth/login`);
    }
    return { error: "Internal Error" };
  }

  redirect(`/${language}/auth/mfa`);
};

export const getErrorText = async (language: string, errorID: string) => {
  return handleErrorById(errorID, language);
};

export const getRedirectPath = AuthenticatedAction(async (session, locale: string) => {
  if (session.user.newlyRegistered || !session.user.hasSecurityQuestions) {
    return { callback: `/${locale}/auth/setup-security-questions` };
  }

  // Get user
  const user = session.user;

  const overdue = await getUnprocessedSubmissionsForUser(user.id).catch((err) => {
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
});

// Internal and private functions - won't be converted into server actions

const validate = async (
  language: string,
  formEntries: {
    [k: string]: FormDataEntryValue;
  }
) => {
  const { t } = await serverTranslation(["auth-verify"], { lang: language });

  const formValidationSchema = v.object({
    verificationCode: v.pipe(
      v.string(),
      v.minLength(1, t("verify.fields.confirmationCode.error.notEmpty")),
      v.length(5, t("verify.fields.confirmationCode.error.length")),
      v.regex(/^[a-z0-9]*$/i, t("verify.fields.confirmationCode.error.noSymbols"))
    ),
    authenticationFlowToken: v.pipe(v.string(), v.minLength(1)),
    email: v.pipe(v.string(), v.trim(), v.toLowerCase(), v.minLength(1)),
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
