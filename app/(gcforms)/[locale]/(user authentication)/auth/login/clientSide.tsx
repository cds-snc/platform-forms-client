"use client";
import { MutableRefObject } from "react";
import { Formik } from "formik";
import { TextInput, Label, Alert, ErrorListItem } from "@clientComponents/forms";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";

import Link from "next/link";

import * as Yup from "yup";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import { useLogin } from "@lib/hooks/auth";
import { AuthErrorsState } from "@lib/hooks/auth/useAuthErrors";
import { Verify } from "@clientComponents/auth/Verify";

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
              </Alert>
            )}
            {Object.keys(errors).length > 0 && !authErrorsState.isError && (
              <Alert
                className="w-full"
                type={ErrorStatus.ERROR}
                validation={true}
                tabIndex={0}
                id="loginValidationErrors"
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
            <h1 className="mb-12 mt-6 border-b-0">{t("title")}</h1>
            <p className="-mt-6 mb-10">
              {t("signUpText")}&nbsp;
              <Link href={"/signup/register"}>{t("signUpLink")}</Link>
            </p>
            <form id="login" method="POST" onSubmit={handleSubmit} noValidate>
              <div className="focus-group">
                <Label id={"label-username"} htmlFor={"username"} className="required" required>
                  {t("fields.username.label")}
                </Label>
                <div className="mb-2 text-sm text-black" id="login-description">
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
              <p className="-mt-6 mb-10">
                <Link href={"/auth/reset-password"} className="-mt-8 mb-10">
                  {t("resetPasswordText")}
                </Link>
              </p>
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

export const Login = () => {
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

export default Login;
