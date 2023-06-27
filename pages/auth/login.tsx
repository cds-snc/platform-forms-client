import React, { ReactElement, MutableRefObject } from "react";
import { Formik } from "formik";
import { TextInput, Label, Alert, ErrorListItem } from "@components/forms";
import { Button } from "@components/globals";
import { useFlag } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import * as Yup from "yup";
import { ErrorStatus } from "@components/forms/Alert/Alert";
import { useLogin } from "@lib/hooks/auth";
import { AuthErrorsState } from "@lib/hooks/auth/useAuthErrors";
import { Verify } from "@components/auth/Verify";

const LoginStep = ({
  username,
  password,
  authErrorsState,
  setNeedsVerification,
  login,
  authErrorsReset,
}: {
  username: MutableRefObject<string>;
  password: MutableRefObject<string>;
  authErrorsState: AuthErrorsState;
  login: (values: { username: string; password: string }) => Promise<boolean | undefined>;
  setNeedsVerification: (val: boolean) => void;
  authErrorsReset: () => void;
}) => {
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

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <Formik
        initialValues={{ username: authErrorsState.isError ? username.current : "", password: "" }}
        onSubmit={async (values, { setSubmitting }) => {
          username.current = values.username;
          password.current = values.password;

          const result = await login({ username: username.current, password: password.current });
          if (result) {
            setNeedsVerification(true);
          }

          setSubmitting(false);
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchema}
        validate={authErrorsReset}
        onReset={authErrorsReset}
      >
        {({ handleSubmit, errors }) => (
          <>
            {authErrorsState.isError && (
              <Alert
                type={ErrorStatus.ERROR}
                heading={authErrorsState.title}
                id="cognitoErrors"
                focussable={true}
              >
                {authErrorsState.description}
                {authErrorsState.callToActionLink ? (
                  <Link href={authErrorsState.callToActionLink}>
                    {authErrorsState.callToActionText}
                  </Link>
                ) : undefined}
                .
              </Alert>
            )}
            {Object.keys(errors).length > 0 && !authErrorsState.isError && (
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
            <h1 className="border-b-0 mt-6 mb-12">{t("title")}</h1>
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
                <div className="text-p text-black-default mb-2" id="login-description">
                  {t("fields.username.description")}
                </div>
                <TextInput
                  className="h-10 w-full max-w-lg rounded"
                  type={"email"}
                  id={"username"}
                  name={"username"}
                  required
                  ariaDescribedBy="login-description"
                />
              </div>
              <div className="focus-group">
                <Label id={"label-password"} htmlFor={"password"} className="required" required>
                  {t("fields.password.label")}
                </Label>
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

              <Button theme="primary" type="submit">
                {t("continueButton")}
              </Button>
            </form>
          </>
        )}
      </Formik>
    </>
  );
};

const Login = () => {
  const {
    username,
    password,
    authenticationFlowToken,
    needsVerification,
    setNeedsVerification,
    authErrorsState,
    authErrorsReset,
    login,
  } = useLogin();

  if (needsVerification) {
    return <Verify username={username} authenticationFlowToken={authenticationFlowToken} />;
  }

  return (
    <LoginStep
      username={username}
      password={password}
      setNeedsVerification={setNeedsVerification}
      login={login}
      authErrorsState={authErrorsState}
      authErrorsReset={authErrorsReset}
    />
  );
};

Login.getLayout = (page: ReactElement) => {
  return <UserNavLayout>{page}</UserNavLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  // @TODO check for account/submissions/unprocessed > 35 submissions and redirect to /auth/restricted-access

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
          "auth-verify",
        ]))),
    },
  };
};

export default Login;
