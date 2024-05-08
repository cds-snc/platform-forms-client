"use server";
import * as v from "valibot";
import { serverTranslation } from "@i18n";
import { sendPasswordResetLink, validateSecurityAnswers } from "@lib/auth";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { logEvent } from "@lib/auditLogs";
import { hasError } from "@lib/hasError";
import { logMessage } from "@lib/logger";
import { handleErrorById } from "@lib/auth/cognito";
import {
  CognitoIdentityProviderServiceException,
  ForgotPasswordCommandInput,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ConfirmForgotPasswordCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  isValidGovEmail,
  containsUpperCaseCharacter,
  containsLowerCaseCharacter,
  containsNumber,
  containsSymbol,
} from "@lib/validation/validation";
import { deleteMagicLinkEntry } from "@lib/auth/passwordReset";
import { cognitoIdentityProviderClient } from "@lib/integration/awsServicesConnector";

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
}

const validateInitialResetForm = async (
  language: string,
  formEntries: {
    [k: string]: FormDataEntryValue;
  }
) => {
  const { t } = await serverTranslation(["common"], { lang: language });
  const schema = v.object({
    username: v.string([
      v.toLowerCase(),
      v.toTrimmed(),
      v.minLength(1, t("input-validation.required")),
      v.email(t("input-validation.email")),
      v.custom((input) => isValidGovEmail(input), t("input-validation.validGovEmail")),
    ]),
  });

  return v.safeParse(schema, formEntries, { abortPipeEarly: true });
};

const validateQuestionChallengeForm = async (
  language: string,
  formEntries: {
    [k: string]: FormDataEntryValue;
  }
) => {
  const { t } = await serverTranslation(["common"], { lang: language });
  const schema = v.object({
    question1: v.string([
      v.toLowerCase(),
      v.toTrimmed(),
      v.minLength(1, t("input-validation.required")),
      v.minLength(4, t("input-validation.min-length-4-characters")),
    ]),
    question1Id: v.string([v.minLength(1, t("input-validation.required"))]),
    question2: v.string([
      v.toLowerCase(),
      v.toTrimmed(),
      v.minLength(1, t("input-validation.required")),
      v.minLength(4, t("input-validation.min-length-4-characters")),
    ]),
    question2Id: v.string([v.minLength(1, t("input-validation.required"))]),
    question3: v.string([
      v.toLowerCase(),
      v.toTrimmed(),
      v.minLength(1, t("input-validation.required")),
      v.minLength(4, t("input-validation.min-length-4-characters")),
    ]),
    question3Id: v.string([v.minLength(1, t("input-validation.required"))]),
    email: v.string([
      v.toLowerCase(),
      v.toTrimmed(),
      v.minLength(1, t("input-validation.required")),
      v.email(t("input-validation.email")),
      v.custom((input) => isValidGovEmail(input), t("input-validation.validGovEmail")),
    ]),
  });

  return v.safeParse(schema, formEntries, { abortPipeEarly: true });
};

const validatePasswordResetForm = async (
  language: string,
  formEntries: { [k: string]: FormDataEntryValue }
) => {
  const { t } = await serverTranslation(["reset-password", "common"], { lang: language });
  const schema = v.object(
    {
      confirmationCode: v.coerce(
        v.number("resetPassword.fields.confirmationCode.error.number"),
        Number
      ),
      username: v.string([
        v.toLowerCase(),
        v.toTrimmed(),
        v.minLength(1, t("input-validation.required")),
        v.email(t("input-validation.email")),
        v.custom((input) => isValidGovEmail(input), t("input-validation.validGovEmail")),
      ]),
      password: v.string([
        v.minLength(8, t("account.fields.password.error.minLength", { ns: "common" })),
        v.maxLength(50, t("account.fields.password.error.maxLength", { ns: "common" })),
        v.custom(
          (password) => containsLowerCaseCharacter(password),
          t("account.fields.password.error.oneLowerCase", { ns: "common" })
        ),
        v.custom(
          (password) => containsUpperCaseCharacter(password),
          t("account.fields.password.error.oneUpperCase", { ns: "common" })
        ),
        v.custom(
          (password) => containsNumber(password),
          t("account.fields.password.error.oneNumber", { ns: "common" })
        ),
        v.custom(
          (password) => containsSymbol(password),
          t("account.fields.password.error.oneSymbol", { ns: "common" })
        ),
      ]),
      passwordConfirmation: v.string([
        v.minLength(1, t("input-validation.required", { ns: "common" })),
      ]),
    },
    [
      v.forward(
        v.custom(
          (input) => input.password === input.passwordConfirmation,
          t("account.fields.passwordConfirmation.error.mustMatch", { ns: "common" })
        ),
        ["passwordConfirmation"]
      ),
    ]
  );
  return v.safeParse(schema, formEntries, { abortPipeEarly: true });
};

export const sendResetLink = async (
  language: string,
  _: ErrorStates,
  formData: FormData
): Promise<ErrorStates> => {
  const rawFormData = Object.fromEntries(formData.entries());
  const validationResult = await validateInitialResetForm(language, rawFormData);
  if (!validationResult.success) {
    return {
      validationErrors: validationResult.issues.map((issue) => ({
        fieldKey: issue.path?.[0].key as string,
        fieldValue: issue.message,
      })),
    };
  }

  return sendPasswordResetLink(validationResult.output.username)
    .then(() => ({}))
    .catch((error) => {
      logMessage.warn(error);
      return { authError: { title: "Interal Error" } };
    });
};

export const checkQuestionChallenge = async (
  language: string,
  _: ErrorStates,
  formData: FormData
): Promise<ErrorStates> => {
  const rawFormData = Object.fromEntries(formData.entries());
  const validationResult = await validateQuestionChallengeForm(language, rawFormData);
  if (!validationResult.success) {
    // Question Ids are not a user input field,  if missing the API is being hit manually
    if (
      checkForSpecificFieldErrors(validationResult.issues, [
        "question1",
        "question2",
        "question3",
        "email",
      ])
    ) {
      return {
        authError: await handleErrorById("InternalServiceExceptionLogin", language),
      };
    } else {
      return {
        validationErrors: validationResult.issues.map((issue) => ({
          fieldKey: issue.path?.[0].key as string,
          fieldValue: issue.message,
        })),
      };
    }
  }
  try {
    const responsesValid = await validateSecurityAnswers({
      email: validationResult.output.email,
      questionsWithAssociatedAnswers: [
        {
          questionId: validationResult.output.question1Id,
          answer: validationResult.output.question1,
        },
        {
          questionId: validationResult.output.question2Id,
          answer: validationResult.output.question2,
        },
        {
          questionId: validationResult.output.question3Id,
          answer: validationResult.output.question3,
        },
      ],
    });

    if (!responsesValid) {
      return {
        authError: await handleErrorById("IncorrectSecurityAnswerException", language),
      };
    }
    // No need to await, this is a fire and forget
    deleteMagicLinkEntry(validationResult.output.email);

    await sendCongnitoCode(validationResult.output.email);
    return {};
  } catch (error) {
    logMessage.warn(
      `Error in Password Reset - Question Challenge: ${(error as Error).message} for user ${
        validationResult.output.email
      }`
    );
    return {
      authError: await handleErrorById("InternalServiceExceptionLogin", language),
    };
  }
};

export const resetPassword = async (
  language: string,
  _: ErrorStates,
  formData: FormData
): Promise<ErrorStates> => {
  const rawFormData = Object.fromEntries(formData.entries());
  const validationResult = await validatePasswordResetForm(language, rawFormData);
  if (!validationResult.success) {
    // Username is not a user input field,  if missing the API is being hit manually
    if (checkForSpecificFieldErrors(validationResult.issues, ["username"])) {
      return {
        authError: await handleErrorById("InternalServiceExceptionLogin", language),
      };
    } else {
      return {
        validationErrors: validationResult.issues.map((issue) => ({
          fieldKey: issue.path?.[0].key as string,
          fieldValue: issue.message,
        })),
      };
    }
  }

  const { confirmationCode, username, password } = validationResult.output;
  try {
    await resetCognitoPassword(username, confirmationCode.toString(), password);
    logPasswordReset(username);
    return {};
  } catch (err) {
    logMessage.warn(
      `Error in Password Reset - Password Confirmation: ${(err as Error).message} for user ${
        validationResult.output.username
      }`
    );
    if (hasError("CodeMismatchException", err)) {
      return {
        authError: await handleErrorById("CodeMismatchException", language),
      };
    } else if (hasError("ExpiredCodeException", err)) {
      return {
        authError: await handleErrorById("ExpiredCodeException", language),
      };
    } else if (hasError("InvalidPasswordException", err)) {
      return {
        authError: await handleErrorById("InvalidPasswordException", language),
      };
    }
    return {
      authError: await handleErrorById("InternalServiceExceptionLogin", language),
    };
  }
};

const logPasswordReset = async (email: string) => {
  const user = await prisma.user
    .findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
      },
    })
    .catch((e) => prismaErrors(e, null));
  logEvent(user?.id ?? "unknown", { type: "User", id: user?.id ?? "unknown" }, "UserPasswordReset");
};

const sendCongnitoCode = async (email: string) => {
  const { COGNITO_APP_CLIENT_ID } = process.env;
  const params: ForgotPasswordCommandInput = {
    ClientId: COGNITO_APP_CLIENT_ID,
    Username: email,
  };

  const forgotPasswordCommand = new ForgotPasswordCommand(params);

  // send command to cognito
  await cognitoIdentityProviderClient.send(forgotPasswordCommand).catch((err) => {
    const cognitoError = err as CognitoIdentityProviderServiceException;
    throw new Error(cognitoError.toString());
  });
};

const resetCognitoPassword = async (
  username: string,
  confirmationCode: string,
  password: string
) => {
  const { COGNITO_APP_CLIENT_ID } = process.env;

  const params: ConfirmForgotPasswordCommandInput = {
    ClientId: COGNITO_APP_CLIENT_ID,
    ConfirmationCode: confirmationCode,
    Username: username,
    Password: password,
  };

  const resetPasswordCommand = new ConfirmForgotPasswordCommand(params);

  await cognitoIdentityProviderClient.send(resetPasswordCommand).catch((err) => {
    const cognitoError = err as CognitoIdentityProviderServiceException;
    throw new Error(cognitoError.toString());
  });
};

const checkForSpecificFieldErrors = (issues: v.SchemaIssues, fields: string[]): boolean => {
  const fieldErrors = issues.filter((issue) => fields.includes(issue.path?.[0].key as string));

  return Boolean(fieldErrors.length);
};
