"use client";
import React, { useState, MutableRefObject } from "react";
import { Formik, FormikHelpers } from "formik";
import { TextInput, Label, Alert, ErrorListItem, Description } from "@clientComponents/forms";
import { Button, LinkButton } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SecurityQuestion } from "@lib/auth";

import * as Yup from "yup";
import {
  containsLowerCaseCharacter,
  containsNumber,
  containsSymbol,
  containsUpperCaseCharacter,
  isValidGovEmail,
} from "@lib/validation";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import { useResetPassword } from "@lib/hooks/auth";
import { AuthErrorsState } from "@lib/hooks/auth/useAuthErrors";

const Step1 = ({
  username,
  nextStep,
  authErrorsState,
  authErrorsReset,
}: {
  username: MutableRefObject<string>;
  nextStep: () => void;
  authErrorsState: AuthErrorsState;
  authErrorsReset: () => void;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["reset-password", "common"]);

  // validation schema for the initial form to send the forgot password verification code
  const sendForgotPasswordValidationSchema = Yup.object().shape({
    username: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .email(t("input-validation.email", { ns: "common" }))
      .test(
        "username-govEmail",
        t("provideUsername.fields.username.error.validGovEmail"),
        (value = "") => isValidGovEmail(value)
      ),
  });

  return (
    <Formik
      initialValues={{ username: "" }}
      validateOnChange={false}
      validateOnBlur={false}
      validationSchema={sendForgotPasswordValidationSchema}
      onSubmit={(values) => {
        username.current = values.username;
        nextStep();
      }}
    >
      {({ handleSubmit, errors }) => (
        <>
          {authErrorsState.isError && (
            <Alert
              type={ErrorStatus.ERROR}
              heading={authErrorsState.title}
              onDismiss={authErrorsReset}
              id="cognitoErrors"
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
              className="w-full"
              type={ErrorStatus.ERROR}
              validation={true}
              tabIndex={0}
              id="registrationValidationErrors"
              heading={t("input-validation.heading", { ns: "common" })}
            >
              <ol className="gc-ordered-list p-0">
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
          <h1 className="mb-12 mt-6 border-b-0">{t("provideUsername.title")}</h1>
          <form id="provideUsername" method="POST" onSubmit={handleSubmit} noValidate>
            <div className="focus-group">
              <Label id="label-username" htmlFor="username" className="required" required>
                {t("provideUsername.fields.username.label")}
              </Label>
              <Description id="username-hint" className="text-black">
                {t("provideUsername.fields.username.hint")}
              </Description>
              <TextInput
                className="h-10 w-full max-w-lg rounded"
                type="email"
                id="username"
                name="username"
                ariaDescribedBy="desc-username-hint"
              />
            </div>

            <Button theme="primary" className="mr-4" type="submit">
              {t("provideUsername.resetPasswordButton")}
            </Button>

            <LinkButton.Secondary href={`/${language}/auth/login`}>
              {t("account.actions.backToSignIn", { ns: "common" })}
            </LinkButton.Secondary>
          </form>
        </>
      )}
    </Formik>
  );
};

// Security questions form
const Step2 = ({
  username,
  confirmSecurityQuestions,
  authErrorsState,
  authErrorsReset,
  userSecurityQuestions,
}: {
  username: MutableRefObject<string>;
  userSecurityQuestions: SecurityQuestion[];
  confirmSecurityQuestions: (
    values: {
      username: string;
      question1: string;
      question2: string;
      question3: string;
      qIds: string;
    },
    helpers: FormikHelpers<{
      username: string;
      question1: string;
      question2: string;
      question3: string;
      qIds: string;
    }>
  ) => Promise<void>;
  authErrorsState: AuthErrorsState;
  authErrorsReset: () => void;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["reset-password", "common"]);
  const langKey = language === "en" ? "questionEn" : "questionFr";

  // validation schema for the initial form to send the forgot password verification code
  const confirmSecurityQuestionsValidationSchema = Yup.object().shape({
    question1: Yup.string()
      .required(t("securityQuestions.inputValidation.required"))
      .min(4, t("securityQuestions.inputValidation.questionLength")),
    question2: Yup.string()
      .required(t("securityQuestions.inputValidation.required"))
      .min(4, t("securityQuestions.inputValidation.questionLength")),
    question3: Yup.string()
      .required(t("securityQuestions.inputValidation.required"))
      .min(4, t("securityQuestions.inputValidation.questionLength")),
  });

  if (!userSecurityQuestions || userSecurityQuestions.length < 3) {
    return (
      <Alert
        type={ErrorStatus.ERROR}
        heading={t("errorPanel.defaultTitle")}
        id="apiErrors"
        focussable={true}
      >
        {t("errorPanel.defaultMessage")}
      </Alert>
    );
  }

  return (
    <Formik
      initialValues={{
        username: username.current,
        question1: "",
        question2: "",
        question3: "",
        qIds: `${userSecurityQuestions[0]?.id},${userSecurityQuestions[1]?.id},${userSecurityQuestions[2]?.id}`,
      }}
      onSubmit={confirmSecurityQuestions}
      validationSchema={confirmSecurityQuestionsValidationSchema}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ handleSubmit, errors }) => (
        <>
          {authErrorsState.isError && (
            <Alert
              type={ErrorStatus.ERROR}
              heading={authErrorsState.title}
              onDismiss={authErrorsReset}
              id="cognitoErrors"
              focussable={true}
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
              heading={
                Object.entries(errors).length === 3
                  ? t("securityQuestions.inputValidation.allRequired.title")
                  : t("input-validation.heading", { ns: "common" })
              }
              focussable={true}
            >
              <ol className="gc-ordered-list">
                {Object.entries(errors).length === 3 ? (
                  <ErrorListItem
                    errorKey={"question1"}
                    key={`resetPassword`}
                    value={t("securityQuestions.inputValidation.allRequired.description")}
                  />
                ) : (
                  Object.entries(errors).map(([fieldKey, fieldValue]) => {
                    return (
                      <ErrorListItem
                        key={`error-${fieldKey}`}
                        errorKey={fieldKey}
                        value={fieldValue}
                      />
                    );
                  })
                )}
              </ol>
            </Alert>
          )}
          <h1 className="mb-12 mt-6 border-b-0">{t("securityQuestions.title")}</h1>
          <p className="mb-6 max-w-lg">{t("securityQuestions.description")}</p>
          <form id="resetPassword" method="POST" onSubmit={handleSubmit} noValidate>
            <div className="focus-group">
              <Label
                id="label-question1"
                htmlFor="question1"
                className="required w-full max-w-lg"
                required
              >
                {userSecurityQuestions[0][langKey]}
              </Label>
              <TextInput
                className="h-10 w-[75%] rounded"
                type="text"
                id="question1"
                name="question1"
                required
              />
            </div>

            <div className="focus-group">
              <Label
                id="label-question2"
                htmlFor="question2"
                className="required w-full max-w-lg"
                required
              >
                {userSecurityQuestions[1][langKey]}
              </Label>
              <TextInput
                className="h-10 w-[75%] rounded"
                type="text"
                id="question2"
                name="question2"
                required
              />
            </div>

            <div className="focus-group">
              <Label
                id="label-question3"
                htmlFor="question3"
                className="required w-full max-w-lg"
                required
              >
                {userSecurityQuestions[2][langKey]}
              </Label>
              <TextInput
                className="h-10 w-[75%] rounded"
                type="text"
                id="question3"
                name="question3"
                required
              />
            </div>

            <div className="buttons">
              <Button theme="primary" type="submit" className="mr-4">
                {t("securityQuestions.resetPasswordButton")}
              </Button>

              <LinkButton.Secondary href={`/${language}/support`}>
                {t("securityQuestions.support")}
              </LinkButton.Secondary>
            </div>
          </form>
        </>
      )}
    </Formik>
  );
};

// Confirm password reset form
const Step3 = ({
  username,
  confirmPasswordReset,
  authErrorsState,
  authErrorsReset,
}: {
  username: MutableRefObject<string>;
  confirmPasswordReset: (
    values: { username: string; password: string; confirmationCode: string },
    helpers: FormikHelpers<{ username: string; password: string; confirmationCode: string }>
  ) => Promise<void>;
  authErrorsState: AuthErrorsState;
  authErrorsReset: () => void;
}) => {
  const { t } = useTranslation(["reset-password", "common"]);

  // validation schema for password reset form
  const confirmPasswordResetValidationSchema = Yup.object().shape({
    confirmationCode: Yup.number()
      .typeError(t("resetPassword.fields.confirmationCode.error.number"))
      .required(t("input-validation.required", { ns: "common" })),
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

  return (
    <Formik
      initialValues={{
        username: username.current,
        password: "",
        confirmationCode: "",
      }}
      onSubmit={confirmPasswordReset}
      validationSchema={confirmPasswordResetValidationSchema}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ handleSubmit, errors }) => (
        <>
          {authErrorsState.isError && (
            <Alert
              type={ErrorStatus.ERROR}
              heading={authErrorsState.title}
              onDismiss={authErrorsReset}
              id="cognitoErrors"
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
          <h1 className="mb-12 mt-6 border-b-0">{t("resetPassword.title")}</h1>
          <form id="resetPassword" method="POST" onSubmit={handleSubmit} noValidate>
            <div className="focus-group">
              <Label
                id="label-confirmationCode"
                htmlFor="confirmationCode"
                className="required"
                required
              >
                {t("resetPassword.fields.confirmationCode.label")}
              </Label>
              <TextInput
                className="h-10 w-36 rounded"
                type="text"
                id="confirmationCode"
                name="confirmationCode"
                required
              />
            </div>
            <div className="focus-group">
              <Label id="label-password" htmlFor="password" className="required" required>
                {t("account.fields.password.label", { ns: "common" })}
              </Label>
              <Description className="text-xl text-black-default" id="password-hint">
                {t("account.fields.password.hint", { ns: "common" })}
              </Description>
              <TextInput
                className="h-10 w-full max-w-lg rounded"
                type="password"
                id="password"
                name="password"
                ariaDescribedBy="desc-username-hint"
              />
            </div>
            <div className="focus-group">
              <Label
                id="label-passwordConfirmation"
                htmlFor="passwordConfirmation"
                className="required"
                required
              >
                {t("account.fields.passwordConfirmation.label", { ns: "common" })}
              </Label>
              <TextInput
                className="h-10 w-full max-w-lg rounded"
                type="password"
                id="passwordConfirmation"
                name="passwordConfirmation"
              />
            </div>

            <div className="buttons">
              <Button theme="primary" type="submit">
                {t("resetPassword.resetPasswordButton")}
              </Button>
            </div>
          </form>
        </>
      )}
    </Formik>
  );
};

export const PasswordResetForm = ({
  email,
  userSecurityQuestions,
}: {
  email: string;
  userSecurityQuestions: SecurityQuestion[];
}) => {
  // we don't put this state in useAuth since its very unique to this page only
  const [initialCodeSent, setInitialCodeSent] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState(
    userSecurityQuestions.length >= 1 ? true : false
  );
  const { i18n } = useTranslation();
  const router = useRouter();

  const {
    username,
    sendResetPasswordMagicLink,
    sendForgotPassword,
    confirmPasswordReset,
    authErrorsState,
    authErrorsReset,
    confirmSecurityQuestions,
  } = useResetPassword({
    email,
    onConfirmSecurityQuestions: () => {
      sendForgotPassword(username.current);
      setInitialCodeSent(true);
      setSecurityQuestions(false);
    },
  });

  // The form to initially send a verification code needed to reset a user's password
  if (!initialCodeSent && !securityQuestions) {
    return (
      <Step1
        username={username}
        authErrorsState={authErrorsState}
        authErrorsReset={authErrorsReset}
        nextStep={async () => {
          sendResetPasswordMagicLink(username.current);
          router.push(`/${i18n.language}/auth/reset-link`);
        }}
      />
    );
  }

  if (securityQuestions) {
    return (
      <Step2
        username={username}
        authErrorsState={authErrorsState}
        authErrorsReset={authErrorsReset}
        confirmSecurityQuestions={confirmSecurityQuestions}
        userSecurityQuestions={userSecurityQuestions}
      />
    );
  }

  // the form to reset the password with the verification code
  return (
    <Step3
      username={username}
      authErrorsState={authErrorsState}
      authErrorsReset={authErrorsReset}
      confirmPasswordReset={confirmPasswordReset}
    />
  );
};
