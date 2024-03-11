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

import { logMessage } from "@lib/logger";

export interface ErrorStates {
  authError?: {
    title: string;
    description: string;
    callToActionText: string;
    callToActionLink: string;
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
  const { t } = await serverTranslation(["signup", "common"], { lang: language });

  const formValidationSchema = v.object(
    {
      name: v.string([
        v.minLength(1, t("input-validation.required", { ns: "common" })),
        v.maxLength(50, t("signUpRegistration.fields.name.error.maxLength")),
      ]),
      username: v.string([
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
  const rawFormData = Object.fromEntries(formData.entries());
  logMessage.debug(rawFormData);
  const result = await validate("en", rawFormData);
  logMessage.debug(result);
  if (!result.success) {
    return {
      validationErrors: result.issues.map((issue) => ({
        fieldKey: issue.path?.[0].key as string,
        fieldValue: issue.message,
      })),
    };
  }
  return { validationErrors: [] };

  // try {
  // Try signing in the newly registered user
  //   const result = await login({ username: username, password: password });
  //   if (result) {
  //     window.dataLayer = window.dataLayer || [];
  //     window.dataLayer.push({
  //       event: "sign_up",
  //       method: "cognito",
  //     });

  //     setNeedsVerification(true);
  //   }
  // } catch (err) {
  //   logMessage.error(err);
  //   if (hasError("UsernameExistsException", err)) {
  //     handleErrorById("UsernameExistsException");
  //     return;
  //   }
  //   handleErrorById(t("InternalServiceException"));
  // }
};
