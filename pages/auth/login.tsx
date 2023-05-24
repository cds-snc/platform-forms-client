import React, { ReactElement, useState, MutableRefObject } from "react";
import { FormikHelpers } from "formik";
import { useRouter } from "next/router";
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
import { useLogin, useVerify } from "@lib/hooks/auth";
import { AuthErrorsState } from "@lib/hooks/auth/useAuthErrors";

const Step1 = ({
  username,
  password,
  authErrorsState,
  setEnterVerification,
  login,
  authErrorsReset,
}: {
  username: MutableRefObject<string>;
  password: MutableRefObject<string>;
  authErrorsState: AuthErrorsState;
  login: (
    values: { username: string; password: string },
    helpers: FormikHelpers<{ username: string; password: string }>
  ) => Promise<boolean | undefined>;
  setEnterVerification: (val: boolean) => void;
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
        onSubmit={async (values, helpers) => {
          username.current = values.username;
          password.current = values.password;
          const result = await login(
            {
              ...values,
            },
            helpers
          );

          if (result) {
            setEnterVerification(true);
          }
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

const Step2 = ({
  username,
  authErrorsState,
  authErrorsReset,
}: {
  username: string;
  authErrorsState: AuthErrorsState;
  authErrorsReset: () => void;
}) => {
  const { t, i18n } = useTranslation(["login", "cognito-errors", "common"]);
  const { verify } = useVerify();
  const router = useRouter();
  const validationSchema = Yup.object().shape({
    verificationCode: Yup.string().required(t("input-validation.required", { ns: "common" })),
  });
  return (
    <>
      <h1 className="border-b-0 mt-6 mb-6">{t("verification.title")}</h1>
      <p className="mb-10">{t("verification.description")}</p>
      <Formik
        initialValues={{ username, verificationCode: "" }}
        onSubmit={async (values) => {
          const { verificationCode, username } = values;
          const data = await verify({ username, verificationCode });
          if (data) {
            router.push({
              pathname: `/${i18n.language}/auth/policy`,
            });
          }
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchema}
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
            <form id="login" method="POST" onSubmit={handleSubmit} noValidate>
              <div className="focus-group">
                <Label
                  id={"label-verificationCode"}
                  htmlFor={"verificationCode"}
                  className="required"
                  required
                >
                  {t("fields.verificationCode.label")}
                </Label>
                <p> {t("fields.verificationCode.description")}</p>
                <TextInput
                  className="h-10 w-full max-w-lg rounded"
                  type={"password"}
                  id={"verificationCode"}
                  name={"verificationCode"}
                  required
                />
              </div>
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
    didConfirm,
    needsConfirmation,
    setNeedsConfirmation,
    authErrorsState,
    authErrorsReset,
    login,
  } = useLogin();

  const confirmationCallback = () => {
    setNeedsConfirmation(false);
    didConfirm.current = true;
  };

  const [enterVerification, setEnterVerification] = useState(true);

  if (needsConfirmation) {
    return (
      <Confirmation
        username={username.current}
        password={password.current}
        confirmationCallback={confirmationCallback}
      />
    );
  }

  return enterVerification ? (
    <Step2
      username={username.current}
      authErrorsState={authErrorsState}
      authErrorsReset={authErrorsReset}
    />
  ) : (
    <Step1
      username={username}
      password={password}
      setEnterVerification={setEnterVerification}
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
