import React from "react";
import { Formik, FormikHelpers } from "formik";
import { TextInput, Label, Alert, ErrorListItem } from "@components/forms";
import { Button } from "@components/globals";
import { useTranslation } from "next-i18next";
import * as Yup from "yup";
import {
  isValidGovEmail,
  containsUpperCaseCharacter,
  containsLowerCaseCharacter,
  containsNumber,
  containsSymbol,
} from "@lib/validation";
import { useAuthErrors } from "@lib/hooks/auth/useAuthErrors";
import { hasError } from "@lib/hasError";
import { fetchWithCsrfToken } from "@lib/hooks/auth/fetchWithCsrfToken";
import { logMessage } from "@lib/logger";
import Link from "next/link";
import { ErrorStatus } from "@components/forms/Alert/Alert";

interface AccountProps {
  username: React.MutableRefObject<string>;
  name: React.MutableRefObject<string>;
  password: React.MutableRefObject<string>;
  successCallback: () => void;
}

export const Account = ({ username, name, password, successCallback }: AccountProps) => {
  const { t } = useTranslation(["signup", "common"]);
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .max(50, t("signUpRegistration.fields.name.error.maxLength")),
    username: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .email(t("input-validation.email", { ns: "common" }))
      .test(
        "username-govEmail",
        t("signUpRegistration.fields.username.error.validGovEmail"),
        (value = "") => isValidGovEmail(value)
      ),
    password: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .min(8, t("account.fields.password.error.minLength", { ns: "common" }))
      .max(50, t("account.fields.password.error.maxLength", { ns: "common" }))
      .test(
        "password-valid-lowerCase",
        t("account.fields.password.error.oneLowerCase", { ns: "common" }),
        (password = "") => containsLowerCaseCharacter(password)
      )
      .test(
        "password-valid-upperCase",
        t("account.fields.password.error.oneUpperCase", { ns: "common" }),
        (password = "") => containsUpperCaseCharacter(password)
      )
      .test(
        "password-valid-number",
        t("account.fields.password.error.oneNumber", { ns: "common" }),
        (password = "") => containsNumber(password)
      )
      .test(
        "password-valid-symbol",
        t("account.fields.password.error.oneSymbol", { ns: "common" }),
        (password = "") => containsSymbol(password)
      ),
    passwordConfirmation: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .oneOf(
        [Yup.ref("password"), null],
        t("account.fields.passwordConfirmation.error.mustMatch", { ns: "common" })
      ),
  });

  const register = async (
    {
      username,
      password,
      name,
    }: {
      username: string;
      password: string;
      name: string;
    },
    { setSubmitting }: FormikHelpers<{ username: string; password: string; name: string }>
  ) => {
    authErrorsReset();
    try {
      await fetchWithCsrfToken("/api/signup/register", {
        username,
        password,
        name,
      });
      successCallback();
    } catch (err) {
      logMessage.error(err);
      if (hasError("UsernameExistsException", err)) {
        handleErrorById("UsernameExistsException");
        return;
      }
      handleErrorById(t("InternalServiceException"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ username: "", name: "", password: "" }}
      onSubmit={async (values, formikHelpers) => {
        username.current = values.username;
        name.current = values.name;
        password.current = values.password;
        await register({ ...values }, formikHelpers);
      }}
      validateOnChange={false}
      validateOnBlur={false}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, errors }) => (
        <>
          {authErrorsState.isError && (
            <Alert
              type={ErrorStatus.ERROR}
              heading={authErrorsState.title}
              onDismiss={authErrorsReset}
              id="cognitoErrors"
              // dismissible={cognitoErrorIsDismissible}
            >
              {authErrorsState.description}&nbsp;
              {authErrorsState.callToActionLink ? (
                <Link href={authErrorsState.callToActionLink}>
                  {authErrorsState.callToActionText}
                </Link>
              ) : undefined}
            </Alert>
          )}
          {Object.keys(errors).length > 0 && !authErrorsState.isError && (
            <Alert
              type={ErrorStatus.ERROR}
              validation={true}
              tabIndex={0}
              id="registrationValidationErrors"
              heading={t("input-validation.heading", { ns: "common" })}
            >
              <ol className="gc-ordered-list">
                {Object.entries(errors).map(([fieldKey, fieldValue]) => {
                  return (
                    <ErrorListItem
                      key={`error-${fieldKey}`}
                      errorKey={fieldKey}
                      value={fieldValue}
                    />
                  );
                })}
              </ol>
            </Alert>
          )}
          <h1 className="border-b-0 mt-6 mb-12">{t("signUpRegistration.title")}</h1>
          <p className="mb-10 -mt-6">
            {t("signUpRegistration.alreadyHaveAnAccount")}&nbsp;
            <Link href={"/auth/login"}>{t("signUpRegistration.alreadyHaveAnAccountLink")}</Link>
          </p>
          <form id="registration" method="POST" onSubmit={handleSubmit} noValidate>
            <div className="focus-group">
              <Label id={"label-name"} htmlFor={"name"} className="required" required>
                {t("signUpRegistration.fields.name.label")}
              </Label>
              <TextInput
                className="h-10 w-full max-w-lg rounded"
                type={"text"}
                id={"name"}
                name={"name"}
              />
            </div>
            <div className="focus-group">
              <Label id={"label-username"} htmlFor={"username"} className="required" required>
                {t("signUpRegistration.fields.username.label")}
              </Label>
              <div className="text-p text-black-default mb-2" id={"username-hint"}>
                {t("signUpRegistration.fields.username.hint")}
              </div>
              <TextInput
                className="h-10 w-full max-w-lg rounded"
                type={"email"}
                id={"username"}
                name={"username"}
                ariaDescribedBy={"desc-username-hint"}
              />
            </div>
            <div className="focus-group">
              <Label id={"label-password"} htmlFor={"password"} className="required" required>
                {t("account.fields.password.label", { ns: "common" })}
              </Label>
              <div className="text-p text-black-default" id={"password-hint"}>
                {t("signUpRegistration.fields.password.requirementsList.title")}
                <ul className="my-2">
                  <li>{t("signUpRegistration.fields.password.requirementsList.eightChars")}</li>
                  <li>{t("signUpRegistration.fields.password.requirementsList.number")}</li>
                  <li>{t("signUpRegistration.fields.password.requirementsList.capital")}</li>
                  <li>{t("signUpRegistration.fields.password.requirementsList.symbol")}</li>
                </ul>
              </div>
              <TextInput
                className="h-10 w-full max-w-lg rounded"
                type={"password"}
                id={"password"}
                name={"password"}
                ariaDescribedBy={"desc-username-hint"}
              />
            </div>
            <div className="focus-group">
              <Label
                id={"label-passwordConfirmation"}
                htmlFor={"passwordConfirmation"}
                className="required"
                required
              >
                {t("account.fields.passwordConfirmation.label", { ns: "common" })}
              </Label>
              <TextInput
                className="h-10 w-full max-w-lg rounded"
                type={"password"}
                id={"passwordConfirmation"}
                name={"passwordConfirmation"}
              />
            </div>
            <p className="mb-10 -mt-2 text-p text-black-default">
              {t("signUpRegistration.termsAgreement")}&nbsp;
              <Link href={"/terms-of-use"}>{t("signUpRegistration.termsAgreementLink")}</Link>
            </p>
            <Button theme="primary" type="submit">
              {t("signUpRegistration.signUpButton")}
            </Button>
          </form>
        </>
      )}
    </Formik>
  );
};
