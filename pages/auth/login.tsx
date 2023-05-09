import React, { ReactElement } from "react";
import { Formik } from "formik";
import { Button, TextInput, Label, Alert, ErrorListItem, Description } from "@components/forms";
import { useAuth, useFlag } from "@lib/hooks";
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

const Login = () => {
  const {
    username,
    password,
    didConfirm,
    needsConfirmation,
    setNeedsConfirmation,
    cognitoError,
    cognitoErrorDescription,
    cognitoErrorCallToActionLink,
    cognitoErrorCallToActionText,
    cognitoErrorIsDismissible,
    setCognitoErrorStates,
    resetCognitoErrorState,
    login,
  } = useAuth();
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
        initialValues={{ username: cognitoError ? username.current : "", password: "" }}
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
      >
        {({ handleSubmit, errors }) => (
          <>
            {cognitoError && (
              <Alert
                type={ErrorStatus.ERROR}
                heading={t("InternalServiceExceptionLogin.title", { ns: "cognito-errors" })}
                onDismiss={resetCognitoErrorState}
                id="cognitoErrors"
                focussable={true}
              >
                {/* TODO refactor to handle other server errors as well */}
                <p className="text-red font-bold">
                  {t("InternalServiceExceptionLogin.description", { ns: "cognito-errors" })}{" "}
                  <Link href={t("InternalServiceExceptionLogin.link", { ns: "cognito-errors" })}>
                    {t("InternalServiceExceptionLogin.linkText", { ns: "cognito-errors" })}
                  </Link>
                  .
                </p>
              </Alert>
            )}
            {Object.keys(errors).length > 0 && !cognitoError && (
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
