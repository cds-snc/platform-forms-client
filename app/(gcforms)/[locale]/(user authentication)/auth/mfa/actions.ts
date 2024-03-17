"use server";
import * as v from "valibot";
import { serverTranslation } from "@i18n";
import { redirect } from "next/navigation";
import { requestNew2FAVerificationCode } from "@lib/auth";
import { signIn } from "@lib/auth";
import { handleErrorById } from "@lib/auth/cognito";
import { cookies } from "next/headers";
import { prisma } from "@lib/integration/prismaConnector";
import { AuthError } from "next-auth";

export interface ErrorStates {
  authError?: {
    id: string;
    title?: string;
    description?: string;
    callToActionText?: string;
    callToActionLink?: string;
  };
  validationErrors: {
    fieldKey: string;
    fieldValue: string;
  }[];
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
      v.toLowerCase(),
      v.minLength(1, t("verify.fields.confirmationCode.error.notEmpty")),
      v.length(5, t("verify.fields.confirmationCode.error.length")),
      v.regex(/^[a-z0-9]*$/i, t("verify.fields.confirmationCode.error.noSymbols")),
    ]),
  });
  return v.safeParse(formValidationSchema, formEntries);
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

  return Boolean(prismaUser?.active);
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
    };
  }
  const authFlowTokenCookie = cookies().get("authenticationFlow");

  // Check if cookie is in the header, if not the 2fa code is expired
  if (!authFlowTokenCookie?.value) {
    return {
      validationErrors: [],
      authError: {
        id: "2FAExpiredSession",
      },
    };
  }

  const { email, authenticationFlowToken }: Record<string, string | undefined> = JSON.parse(
    authFlowTokenCookie.value
  );

  // Invalid Cookie. Delete and redirect to login
  if (!email || !authenticationFlowToken) {
    clearAuthTokenCookie();
    redirect(`/${language}/auth/login`);
  }

  // If the cookie exists but the token does not exist in the database, the user is locked out
  if (await isUserLockedOut(email)) {
    return {
      validationErrors: [],
      authError: {
        id: "2FALockedOutSession",
      },
    };
  }

  // Will redirect if user account is not active
  if (!(await isUserActive(email))) {
    redirect(`/${language}/auth/account-deactivated`);
  }

  const verificationCode = valid.output.verificationCode;

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
    if (err instanceof AuthError && err.name === "CredentialsSignin") {
      return {
        validationErrors: [],
        authError: {
          id: "2FAInvalidVerificationCode",
          ...(await handleErrorById("2FAInvalidVerificationCode", language)),
        },
      };
    }

    return {
      validationErrors: [],
      authError: {
        id: "InternalNextAuthError",
        ...(await handleErrorById((err as Error).message, language)),
      },
    };
  }

  // Remove the auth flow cookie after a sucessfull login
  clearAuthTokenCookie();

  return {
    validationErrors: [],
  };
};

export const resendVerificationCode = async (
  language: string,
  email: string,
  authenticationFlowToken: string
): Promise<void> => {
  await requestNew2FAVerificationCode(authenticationFlowToken, email);
  redirect(`/${language}/auth/mfa`);
};

export const clearAuthTokenCookie = () => {
  cookies().delete("authenticationFlow");
};
