"use server";
import * as v from "valibot";
import {
  isValidGovEmail,
  containsUpperCaseCharacter,
  containsLowerCaseCharacter,
  containsNumber,
  containsSymbol,
} from "@lib/validation";
import { serverTranslation } from "@i18n";
import { begin2FAAuthentication, initiateSignIn } from "@lib/auth";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  SignUpCommandInput,
  CognitoIdentityProviderServiceException,
} from "@aws-sdk/client-cognito-identity-provider";

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

const validate = async (
  language: string,
  formEntries: {
    [k: string]: FormDataEntryValue;
  }
) => {
  const { t } = await serverTranslation(["signup", "common"], { lang: language });

  const formValidationSchema = v.object(
    {
      name: v.string([
        v.minLength(1, t("input-validation.required", { ns: "common" })),
        v.maxLength(50, t("signUpRegistration.fields.name.error.maxLength")),
      ]),
      username: v.string([
        v.toLowerCase(),
        v.toTrimmed(),
        v.minLength(1, t("input-validation.required", { ns: "common" })),
        v.email(t("input-validation.email", { ns: "common" })),
        v.custom(
          (input) => isValidGovEmail(input),
          t("signUpRegistration.fields.username.error.validGovEmail")
        ),
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
  return v.safeParse(formValidationSchema, formEntries);
};
export const register = async (
  language: string,
  _: ErrorStates,
  formData: FormData
): Promise<ErrorStates> => {
  const { COGNITO_REGION, COGNITO_APP_CLIENT_ID } = process.env;
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

  // instantiate the cognito client object. cognito is region specific and so a region must be specified
  const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
  });

  // instantiate the signup command object
  const signUpCommand = new SignUpCommand(params);

  try {
    await cognitoClient.send(signUpCommand);
  } catch (err) {
    // if there is an error, forward the status code and the error message as the body

    const cognitoError = err as CognitoIdentityProviderServiceException;
    if (cognitoError.name === "UsernameExistsException") {
      return { validationErrors: [], authError: { title: t("UsernameExistsException") } };
    }
    return { validationErrors: [], authError: { title: t("InternalServiceException") } };
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
