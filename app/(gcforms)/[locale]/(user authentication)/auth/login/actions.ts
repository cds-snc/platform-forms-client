"use server";
import * as v from "valibot";
import { serverTranslation } from "@i18n";
import { begin2FAAuthentication, initiateSignIn } from "@lib/auth";
import { redirect } from "next/navigation";
import { CognitoIdentityProviderServiceException } from "@aws-sdk/client-cognito-identity-provider";
import { hasError } from "@lib/hasError";
import { handleErrorById } from "@lib/auth/cognito";

export interface ErrorStates {
  authError?: {
    title: string;
    description?: string;
    callToActionText?: string;
    callToActionLink?: string;
  };
  validationErrors?: {
    fieldKey: string;
    fieldValue: string;
  }[];
  authFlowToken?: {
    email: string;
    authenticationFlowToken: string;
  };
}

const validate = async (
  language: string,
  formEntries: {
    [k: string]: FormDataEntryValue;
  }
) => {
  const { t } = await serverTranslation(["login", "common"], { lang: language });

  const formValidationSchema = v.object({
    username: v.string([
      v.toLowerCase(),
      v.toTrimmed(),
      v.minLength(1, t("input-validation.required", { ns: "common" })),
      v.email(t("input-validation.email", { ns: "common" })),
    ]),
    password: v.string([
      v.minLength(1, t("input-validation.required", { ns: "common" })),
      v.maxLength(50, t("fields.password.errors.maxLength")),
    ]),
  });
  return v.safeParse(formValidationSchema, formEntries, { abortPipeEarly: true });
};
export const login = async (
  language: string,
  _: ErrorStates,
  formData: FormData
): Promise<ErrorStates> => {
  const rawFormData = Object.fromEntries(formData.entries());

  const validationResult = await validate(language, rawFormData);

  if (!validationResult.success) {
    return {
      validationErrors: validationResult.issues.map((issue) => ({
        fieldKey: issue.path?.[0].key as string,
        fieldValue: issue.message,
      })),
    };
  }

  if (process.env.APP_ENV === "test") {
    const authenticationFlowToken = await begin2FAAuthentication({
      email: validationResult.output.username,
      token: "testCognitoToken",
    }).catch((err) => {
      if (hasError("AccountDeactivated", err)) {
        redirect(`/${language}/auth/account-deactivated`);
      } else {
        throw err;
      }
    });
    return {
      validationErrors: [],
      authFlowToken: {
        email: validationResult.output.username,
        authenticationFlowToken,
      },
    };
  }

  const cognitoResult: {
    email?: string;
    token?: string;
    authError?: string;
  } | null = await initiateSignIn({
    username: validationResult.output.username,
    password: validationResult.output.password,
  }).catch(async (err) => {
    const cognitoError = err as CognitoIdentityProviderServiceException;
    return { authError: cognitoError.name };
  });

  if (cognitoResult?.authError) {
    if (hasError(["UserNotFoundException", "NotAuthorizedException"], cognitoResult.authError)) {
      return {
        validationErrors: [],
        authError: await handleErrorById("UsernameOrPasswordIncorrect", language),
      };
    }

    if (hasError("PasswordResetRequiredException", cognitoResult.authError)) {
      redirect(`/${language}/auth/reset-password`);
    }

    if (hasError("AccountDeactivated", cognitoResult.authError)) {
      redirect(`/${language}/auth/account-deactivated`);
    }

    if (hasError("PasswordResetRequiredException", cognitoResult.authError)) {
      redirect(`/${language}/auth/reset-password`);
    }
  }

  if (cognitoResult?.email && cognitoResult?.token) {
    const authenticationFlowToken = await begin2FAAuthentication({
      email: cognitoResult.email,
      token: cognitoResult.token,
    }).catch((err) => {
      if (hasError("AccountDeactivated", err)) {
        redirect(`/${language}/auth/account-deactivated`);
      } else {
        throw err;
      }
    });

    return {
      validationErrors: [],
      authFlowToken: {
        email: cognitoResult.email,
        authenticationFlowToken,
      },
    };
  }

  return {
    validationErrors: [],
    authError: await handleErrorById("InternalServiceExceptionLogin", language),
  };
};
