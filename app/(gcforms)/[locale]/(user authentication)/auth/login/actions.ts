"use server";
import * as v from "valibot";
import { serverTranslation } from "@i18n";
import { begin2FAAuthentication, initiateSignIn } from "@lib/auth";
import { redirect } from "next/navigation";
import { CognitoIdentityProviderServiceException } from "@aws-sdk/client-cognito-identity-provider";
import { hasError } from "@lib/hasError";

export interface ErrorStates {
  authError?: {
    title: string;
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
  const { t } = await serverTranslation(["login", "common"], { lang: language });

  const formValidationSchema = v.object({
    username: v.string([
      v.minLength(1, t("input-validation.required", { ns: "common" })),
      v.email(t("input-validation.email", { ns: "common" })),
    ]),
    password: v.string([
      v.minLength(1, t("input-validation.required", { ns: "common" })),
      v.maxLength(50, t("fields.password.errors.maxLength")),
    ]),
  });
  return v.safeParse(formValidationSchema, formEntries);
};
async function handleErrorById(id: string, language: string) {
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
    });
    redirect(`/${language}/auth/mfa?token=${authenticationFlowToken}&user=${cognitoResult.email}`);
  }

  return {
    validationErrors: [],
    authError: await handleErrorById("InternalServiceExceptionLogin", language),
  };
};
