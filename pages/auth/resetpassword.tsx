import React, { ReactElement, useState } from "react";
import { Formik } from "formik";
import { Button, TextInput, Label, Alert, ErrorListItem, Description } from "@components/forms";
import { useAuth } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { Confirmation } from "@components/auth/Confirmation/Confirmation";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import { checkOne } from "@lib/cache/flags";
import Link from "next/link";
import Head from "next/head";
import * as Yup from "yup";
import { isLowerCase, isNumber, isSymbol, isUpperCase, isValidGovEmail } from "@lib/validation";

const ResetPassword = () => {
  const {
    username,
    cognitoError,
    cognitoErrorDescription,
    cognitoErrorCallToActionLink,
    cognitoErrorCallToActionText,
    cognitoErrorIsDismissible,
    needsConfirmation,
    setNeedsConfirmation,
    resetCognitoErrorState,
    sendForgotPassword,
    confirmPasswordReset,
  } = useAuth();

  const { t } = useTranslation(["reset-password", "common"]);

  // we don't put this state in useAuth since its very unique to this page only
  const [initialCodeSent, setInitialCodeSent] = useState(false);

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

  // validation schema for password reset form
  const confirmPasswordResetValidationSchema = Yup.object().shape({
    confirmationCode: Yup.number()
      .typeError(t("resetPassword.fields.confirmationCode.error.number"))
      .required(t("input-validation.required", { ns: "common" })),
    password: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .min(8, t("resetPassword.fields.password.error.minLength"))
      .max(50, t("resetPassword.fields.password.error.maxLength"))
      .test(
        "password-valid-lowerCase",
        t("resetPassword.fields.password.error.oneLowerCase"),
        (password = "") => isLowerCase(password)
      )
      .test(
        "password-valid-upperCase",
        t("resetPassword.fields.password.error.oneUpperCase"),
        (password = "") => isUpperCase(password)
      )
      .test(
        "password-valid-number",
        t("resetPassword.fields.password.error.oneNumber"),
        (password = "") => isNumber(password)
      )
      .test(
        "password-valid-symbol",
        t("resetPassword.fields.password.error.oneSymbol"),
        (password = "") => isSymbol(password)
      ),
    passwordConfirmation: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .oneOf(
        [Yup.ref("password"), null],
        t("resetPassword.fields.passwordConfirmation.error.mustMatch")
      ),
  });

  // confirmation code form in case a user has not yet confirmed their account
  // password resets are not allowed by cognito unless someone has confirmed their account
  if (needsConfirmation) {
    return (
      <Confirmation
        username={username.current}
        password={""}
        confirmationAuthenticationFailedCallback={() => ""}
        confirmationCallback={() => {
          setNeedsConfirmation(false);
        }}
        shouldSignIn={false}
      />
    );
  }

  // The form to initially send a verification code needed to reset a user's password
  if (!initialCodeSent && !needsConfirmation) {
    return (
      <>
        <Head>
          <title>{t("provideUsername.title")}</title>
        </Head>
        <Formik
          initialValues={{ username: "" }}
          validateOnChange={false}
          validateOnBlur={false}
          validationSchema={sendForgotPasswordValidationSchema}
          onSubmit={async (values) => {
            // set the username ( user's email ) to what was provided
            username.current = values.username;
            // call the sendForgotPassword method to attempt to send the verification code to the user
            await sendForgotPassword(
              values.username,
              () => {
                // if sending of the code succeeds we set the initialCodeSent state to true
                // this will display the form to set the new password
                setInitialCodeSent(true);
              },
              (error) => {
                // The InvalidParameterException error will be returned in two cases
                // 1. Where a user does not have an account
                // 2. Where a user does not have a verified email
                // We will show the confirmation code page in this case
                // If a user does not have an account they will not be able to progress
                // those that do but have not verified their email will be able to verify their
                // email first and then return to set their passwords
                if (error === "InvalidParameterException") {
                  setNeedsConfirmation(true);
                }
              }
            );
          }}
        >
          {({ handleSubmit, errors }) => (
            <>
              {cognitoError && (
                <Alert
                  type="error"
                  heading={cognitoError}
                  onDismiss={resetCognitoErrorState}
                  id="cognitoErrors"
                  dismissible={cognitoErrorIsDismissible}
                >
                  {cognitoErrorDescription}&nbsp;
                  {cognitoErrorCallToActionLink ? (
                    <Link href={cognitoErrorCallToActionLink}>{cognitoErrorCallToActionText}</Link>
                  ) : undefined}
                </Alert>
              )}
              {Object.keys(errors).length > 0 && !cognitoError && (
                <Alert
                  type="error"
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
              <h1>{t("provideUsername.title")}</h1>
              <form id="provideUsername" method="POST" onSubmit={handleSubmit} noValidate>
                <div className="focus-group">
                  <Label id="label-username" htmlFor="username" className="required" required>
                    {t("provideUsername.fields.username.label")}
                  </Label>
                  <Description id="username-hint" className="text-p text-black-default">
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

                <Button className="gc-button--blue" type="submit">
                  {t("provideUsername.resetPasswordButton")}
                </Button>
              </form>
            </>
          )}
        </Formik>
      </>
    );
  }

  // the form to reset the password with the verification code
  return (
    <>
      <Head>
        <title>{t("resetPassword.title")}</title>
      </Head>
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
            {cognitoError && (
              <Alert
                type="error"
                heading={cognitoError}
                onDismiss={resetCognitoErrorState}
                id="cognitoErrors"
                dismissible={cognitoErrorIsDismissible}
              >
                {cognitoErrorDescription}&nbsp;
                {cognitoErrorCallToActionLink ? (
                  <Link href={cognitoErrorCallToActionLink}>{cognitoErrorCallToActionText}</Link>
                ) : undefined}
              </Alert>
            )}
            {Object.keys(errors).length > 0 && !cognitoError && (
              <Alert
                type="error"
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
            <h1>{t("resetPassword.title")}</h1>
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
                  {t("resetPassword.fields.password.label")}
                </Label>
                <Description className="text-p text-black-default" id="password-hint">
                  {t("resetPassword.fields.password.hint")}
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
                  {t("resetPassword.fields.passwordConfirmation.label")}
                </Label>
                <TextInput
                  className="h-10 w-full max-w-lg rounded"
                  type="password"
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                />
              </div>
              <div className="buttons">
                <Button className="gc-button--blue" type="submit">
                  {t("resetPassword.resetPasswordButton")}
                </Button>
              </div>
            </form>
          </>
        )}
      </Formik>
    </>
  );
};

ResetPassword.getLayout = (page: ReactElement) => {
  return <UserNavLayout>{page}</UserNavLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // if the password reset feature flag is not enabled. Redirect to the login page
  const passwordResetEnabled = await checkOne("passwordReset");
  if (!passwordResetEnabled) {
    return {
      redirect: {
        destination: `/${context.locale}/auth/login`,
        permanent: false,
      },
    };
  }
  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context.locale, [
          "common",
          "cognito-errors",
          "reset-password",
          "signup",
        ]))),
    },
  };
};

export default ResetPassword;
