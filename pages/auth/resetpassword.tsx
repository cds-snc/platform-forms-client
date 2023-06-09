import React, { ReactElement, useState, MutableRefObject } from "react";
import { Formik, FormikHelpers } from "formik";
import { TextInput, Label, Alert, ErrorListItem, Description } from "@components/forms";
import { Button, LinkButton } from "@components/globals";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import { checkOne } from "@lib/cache/flags";
import Link from "next/link";
import Head from "next/head";
import * as Yup from "yup";
import {
  containsLowerCaseCharacter,
  containsNumber,
  containsSymbol,
  containsUpperCaseCharacter,
  isValidGovEmail,
} from "@lib/validation";
import { ErrorStatus } from "@components/forms/Alert/Alert";
import { useResetPassword } from "@lib/hooks/auth";
import { AuthErrorsState } from "@lib/hooks/auth/useAuthErrors";

const Step1 = ({
  username,
  setInitialCodeSent,
  sendForgotPassword,
  authErrorsState,
  authErrorsReset,
}: {
  username: MutableRefObject<string>;
  sendForgotPassword: (
    username: string,
    successCallback: () => void,
    failedCallback?: (error: string) => void
  ) => void;
  setInitialCodeSent: (val: boolean) => void;
  authErrorsState: AuthErrorsState;
  authErrorsReset: () => void;
}) => {
  const { t, i18n } = useTranslation(["reset-password", "common"]);

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
          sendForgotPassword(values.username, () => {
            // if sending of the code succeeds we set the initialCodeSent state to true
            // this will display the form to set the new password
            setInitialCodeSent(true);
          });
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
            <h1 className="border-b-0 mt-6 mb-12">{t("provideUsername.title")}</h1>
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

              <Button theme="primary" className="mr-4" type="submit">
                {t("provideUsername.resetPasswordButton")}
              </Button>

              <LinkButton.Secondary href={`/${i18n.language}/auth/login`}>
                {t("account.actions.backToSignIn", { ns: "common" })}
              </LinkButton.Secondary>
            </form>
          </>
        )}
      </Formik>
    </>
  );
};

const Step2 = ({
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
            <h1 className="border-b-0 mt-6 mb-12">{t("resetPassword.title")}</h1>
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
                <Description className="text-p text-black-default" id="password-hint">
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
    </>
  );
};

const ResetPassword = () => {
  const { username, sendForgotPassword, confirmPasswordReset, authErrorsState, authErrorsReset } =
    useResetPassword();

  // we don't put this state in useAuth since its very unique to this page only
  const [initialCodeSent, setInitialCodeSent] = useState(false);

  // The form to initially send a verification code needed to reset a user's password
  if (!initialCodeSent) {
    return (
      <Step1
        username={username}
        authErrorsState={authErrorsState}
        authErrorsReset={authErrorsReset}
        sendForgotPassword={sendForgotPassword}
        setInitialCodeSent={setInitialCodeSent}
      />
    );
  }

  // the form to reset the password with the verification code
  return (
    <Step2
      username={username}
      authErrorsState={authErrorsState}
      authErrorsReset={authErrorsReset}
      confirmPasswordReset={confirmPasswordReset}
    />
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
