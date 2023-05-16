import React, { ReactElement } from "react";
import { Formik } from "formik";
import { TextInput, Label, Alert, ErrorListItem, Description } from "@components/forms";
import { Button } from "@components/globals";
import { useFlag } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { Confirmation } from "@components/auth/Confirmation/Confirmation";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import * as Yup from "yup";
import { ErrorStatus } from "@components/forms/Alert/Alert";
import { useLogin } from "@lib/hooks/auth";

const Login = () => {
  const {
    username,
    password,
    didConfirm,
    needsConfirmation,
    setNeedsConfirmation,

    // cognitoError,
    // cognitoErrorDescription,
    // cognitoErrorCallToActionLink,
    // cognitoErrorCallToActionText,
    // setCognitoErrorStates,
    // resetCognitoErrorState,

    login,
    authErrorState,
    authErrorsReset,
    manualUpdate,
  } = useLogin();
  const { t } = useTranslation(["login", "cognito-errors", "common"]);
  const { status: registrationOpen } = useFlag("accountRegistration");
  const { status: passwordResetEnabled } = useFlag("passwordReset");

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .email(t("input-validation.email", { ns: "common" })),
    password: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .max(50, t("fields.password.errors.maxLength")),
  });

  const confirmationCallback = () => {
    setNeedsConfirmation(false);
    didConfirm.current = true;
  };

  const setCognitoErrorStates = (
    cognitoError: string,
    cognitoErrorDescription: string,
    cognitoErrorCallToActionLink: string,
    cognitoErrorCallToActionText: string
    // cognitoErrorIsDismissible: boolean
  ) => {
    manualUpdate({
      title: cognitoError,
      description: cognitoErrorDescription,
      callToActionLink: cognitoErrorCallToActionLink,
      callToActionText: cognitoErrorCallToActionText,
    });
  };

  if (needsConfirmation) {
    return (
      <Confirmation
        username={username.current}
        password={password.current}
        confirmationAuthenticationFailedCallback={setCognitoErrorStates}
        confirmationCallback={confirmationCallback}
      />
    );
  }

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <Formik
        initialValues={{ username: authErrorState.title ? username.current : "", password: "" }}
        onSubmit={async (values, helpers) => {
          username.current = values.username;
          password.current = values.password;
          await login(
            {
              ...values,
            },
            helpers
          );
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchema}
        validate={authErrorsReset}
        onReset={authErrorsReset}
      >
        {({ handleSubmit, errors }) => (
          <>
            {authErrorState.title && (
              <Alert
                type={ErrorStatus.ERROR}
                heading={authErrorState.title}
                id="cognitoErrors"
                focussable={true}
              >
                {authErrorState.description}
                {authErrorState.callToActionLink ? (
                  <Link href={authErrorState.callToActionLink}>
                    {authErrorState.callToActionText}
                  </Link>
                ) : undefined}
                .
              </Alert>
            )}
            {Object.keys(errors).length > 0 && !authErrorState.title && (
              <Alert
                type={ErrorStatus.ERROR}
                validation={true}
                tabIndex={0}
                id="loginValidationErrors"
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
            <h1>{t("title")}</h1>
            {registrationOpen && (
              <p className="mb-10 -mt-6">
                {t("signUpText")}&nbsp;
                <Link href={"/signup/register"}>{t("signUpLink")}</Link>
              </p>
            )}
            <form id="login" method="POST" onSubmit={handleSubmit} noValidate>
              <div className="focus-group">
                <Label id={"label-username"} htmlFor={"username"} className="required" required>
                  {t("fields.username.label")}
                </Label>
                <Description className="text-p text-black-default" id="login">
                  {t("fields.username.description")}
                </Description>
                <TextInput
                  className="h-10 w-full max-w-lg rounded"
                  type={"email"}
                  id={"username"}
                  name={"username"}
                  required
                />
              </div>
              <div className="focus-group">
                <Label id={"label-password"} htmlFor={"password"} className="required" required>
                  {t("fields.password.label")}
                </Label>
                <Description id="password" className="text-p text-black-default">
                  {t("fields.password.description")}
                </Description>
                <TextInput
                  className="h-10 w-full max-w-lg rounded"
                  type={"password"}
                  id={"password"}
                  name={"password"}
                  required
                />
              </div>
              {passwordResetEnabled && (
                <p className="mb-10 -mt-6">
                  <Link href={"/auth/resetpassword"} className="-mt-8 mb-10">
                    {t("resetPasswordText")}
                  </Link>
                </p>
              )}

              <Button className="gc-button--blue" type="submit">
                {t("signInButton")}
              </Button>
            </form>
          </>
        )}
      </Formik>
    </>
  );
};

Login.getLayout = (page: ReactElement) => {
  return <UserNavLayout>{page}</UserNavLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session)
    return {
      redirect: {
        destination: `/${context.locale}/myforms/`,
        permanent: false,
      },
    };

  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context.locale, [
          "common",
          "signup",
          "login",
          "cognito-errors",
        ]))),
    },
  };
};

export default Login;
