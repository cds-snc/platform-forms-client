"use server";

import * as v from "valibot";
import {
  isValidGovEmail,
  containsUpperCaseCharacter,
  containsLowerCaseCharacter,
  containsNumber,
  containsSymbol,
} from "@lib/validation/validation";
import { serverTranslation } from "@i18n";
import { begin2FAAuthentication, initiateSignIn } from "@lib/auth";
import {
  SignUpCommand,
  SignUpCommandInput,
  CognitoIdentityProviderServiceException,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoIdentityProviderClient } from "@lib/integration/awsServicesConnector";
import { logMessage } from "@lib/logger";

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
    authenticationFlowToken: string;
    email: string;
  };
}

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const register = async (
  language: string,
  _: ErrorStates,
  formData: FormData
): Promise<ErrorStates> => {
  const { COGNITO_APP_CLIENT_ID } = process.env;
  const { t } = await serverTranslation("cognito-errors", { lang: language });
  const rawFormData = Object.fromEntries(formData.entries());

  const result = await validate(language, rawFormData);

  if (!result.success) {
    return {
      validationErrors: result.issues.map((issue) => ({
        fieldKey: issue.path?.[0].key as string,
        fieldValue: issue.message,
      })),
    };
  }

  const params: SignUpCommandInput = {
    ClientId: COGNITO_APP_CLIENT_ID,
    Password: result.output.password,
    Username: result.output.username,
    UserAttributes: [
      {
        Name: "name",
        Value: result.output.name,
      },
    ],
  };

  // instantiate the signup command object
  const signUpCommand = new SignUpCommand(params);

  try {
    await cognitoIdentityProviderClient.send(signUpCommand);
    logMessage.info("HealthCheck: cognito sign-up success");
  } catch (err) {
    logMessage.info("HealthCheck: cognito sign-up failure");

    // if there is an error, forward the status code and the error message as the body
    const cognitoError = err as CognitoIdentityProviderServiceException;
    if (cognitoError.name === "UsernameExistsException") {
      return { validationErrors: [], authError: { title: t("UsernameExistsException") } };
    }
    return { validationErrors: [], authError: { title: t("InternalServiceException") } };
  }

  // Check email for potential shared access email and flag to Slack if found
  const addressPart = result.output.username.split("@")[0];

  if (
    (addressPart.includes("-") && !addressPart.includes(".")) ||
    (!addressPart.includes(".") && !addressPart.includes("-"))
  ) {
    logMessage.warn(
      `Flagged new GC Forms account \nPotential shared access email address: ${result.output.username} \nReview and deactivate account if it's a shared inbox \n\nSeverity level: 2`
    );
  }

  // Continue sign in process with 2FA
  const cognitoToken = await initiateSignIn({
    username: result.output.username,
    password: result.output.password,
  });

  if (cognitoToken) {
    const authenticationFlowToken = await begin2FAAuthentication(cognitoToken);
    return { authFlowToken: { authenticationFlowToken, email: result.output.username } };
  }

  return { validationErrors: [], authError: { title: t("InternalServiceException") } };
};

// Internal and private functions - won't be converted into server actions

const validate = async (
  language: string,
  formEntries: {
    [k: string]: FormDataEntryValue;
  }
) => {
  const { t } = await serverTranslation(["signup", "common"], { lang: language });

  const formValidationSchema = v.pipe(
    v.object({
      name: v.pipe(
        v.string(),
        v.minLength(1, t("input-validation.required", { ns: "common" })),
        v.maxLength(50, t("signUpRegistration.fields.name.error.maxLength"))
      ),
      username: v.pipe(
        v.string(),
        v.toLowerCase(),
        v.trim(),
        v.minLength(1, t("input-validation.required", { ns: "common" })),
        v.check((input) => isValidGovEmail(input), t("input-validation.validGovEmail"))
      ),
      password: v.pipe(
        v.string(),
        v.trim(),
        v.minLength(1, t("input-validation.required", { ns: "common" })),
        v.minLength(8, t("account.fields.password.error.minLength", { ns: "common" })),
        v.maxLength(50, t("account.fields.password.error.maxLength", { ns: "common" })),
        v.check(
          (password) => containsLowerCaseCharacter(password),
          t("account.fields.password.error.oneLowerCase", { ns: "common" })
        ),
        v.check(
          (password) => containsUpperCaseCharacter(password),
          t("account.fields.password.error.oneUpperCase", { ns: "common" })
        ),
        v.check(
          (password) => containsNumber(password),
          t("account.fields.password.error.oneNumber", { ns: "common" })
        ),
        v.check(
          (password) => containsSymbol(password),
          t("account.fields.password.error.oneSymbol", { ns: "common" })
        )
      ),
      passwordConfirmation: v.pipe(
        v.string(),
        v.trim(),
        v.minLength(1, t("input-validation.required", { ns: "common" }))
      ),
    }),
    v.forward(
      v.check(
        (input) => input.password === input.passwordConfirmation,
        t("account.fields.passwordConfirmation.error.mustMatch", { ns: "common" })
      ),
      ["passwordConfirmation"]
    )
  );
  return v.safeParse(formValidationSchema, formEntries, { abortPipeEarly: true });
};
