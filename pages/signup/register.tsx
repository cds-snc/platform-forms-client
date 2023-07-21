import React, { ReactElement, useRef } from "react";
import { Formik } from "formik";
import { TextInput, Label, Alert, ErrorListItem } from "@components/forms";
import { Button } from "@components/globals";
import { useFlag } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import * as Yup from "yup";
import {
  isValidGovEmail,
  containsUpperCaseCharacter,
  containsLowerCaseCharacter,
  containsNumber,
  containsSymbol,
} from "@lib/validation";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import Loader from "@components/globals/Loader";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import Head from "next/head";
import { ErrorStatus } from "@components/forms/Alert/Alert";
import { fetchWithCsrfToken } from "@lib/hooks/auth/fetchWithCsrfToken";
import { hasError } from "@lib/hasError";
import { logMessage } from "@lib/logger";
import { Verify } from "@components/auth/Verify";
import { useLogin } from "@lib/hooks/auth";
import { useFocusIt } from "@lib/hooks/useFocusIt";

const Register = () => {
  const { isLoading, status: registrationOpen } = useFlag("accountRegistration");
  const { t } = useTranslation(["signup", "common"]);
  const {
    username,
    password,
    authenticationFlowToken,
    needsVerification,
    setNeedsVerification,
    authErrorsState,
    authErrorsReset,
    login,
    handleErrorById,
  } = useLogin();

  const headingRef = useRef(null);
  useFocusIt({ elRef: headingRef });

  const register = async ({
    username,
    password,
    name,
  }: {
    username: string;
    password: string;
    name: string;
  }) => {
    authErrorsReset();
    try {
      // Register the user. An error is thrown if the username exists etc.
      await fetchWithCsrfToken("/api/account/register", {
        username,
        password,
        name,
      });

      // Try signing in the newly registered user
      const result = await login({ username: username, password: password });
      if (result) {
        setNeedsVerification(true);
      }
    } catch (err) {
      logMessage.error(err);
      if (hasError("UsernameExistsException", err)) {
        handleErrorById("UsernameExistsException");
        return;
      }
      handleErrorById(t("InternalServiceException"));
    }
  };

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

  if (isLoading) {
    return (
      <>
        <Head>
          <title>{t("signUpRegistration.title")}</title>
        </Head>
        <h1 className="border-b-0 mt-6 mb-12">{t("signUpRegistration.title")}</h1>
        <Loader message={t("loading")} />
      </>
    );
  }

  if (!registrationOpen) {
    return (
      <>
        <Head>
          <title>{t("signUpRegistration.title")}</title>
        </Head>
        <h1 className="border-b-0 mt-6 mb-12">{t("signUpRegistration.title")}</h1>
        <p>{t("registrationClosed")}</p>
      </>
    );
  }

  if (needsVerification) {
    return (
      <>
        <Verify
          type="register"
          username={username}
          authenticationFlowToken={authenticationFlowToken}
        />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t("signUpRegistration.title")}</title>
      </Head>
      <Formik
        initialValues={{ username: "", password: "", passwordConfirmation: "", name: "" }}
        onSubmit={async (values, { setSubmitting }) => {
          username.current = values.username;
          password.current = values.password;
          await register({
            username: username.current,
            password: password.current,
            name: values.name,
          });
          setSubmitting(false);
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
                focussable={true}
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
                focussable={true}
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
            <h1 ref={headingRef} className="border-b-0 mt-6 mb-12">
              {t("signUpRegistration.title")}
            </h1>
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
                  ariaDescribedBy={"username-hint"}
                />
              </div>
              <div className="focus-group">
                <Label id={"label-password"} htmlFor={"password"} className="required" required>
                  {t("signUpRegistration.fields.password.label")}
                </Label>
                <div className="text-p text-black-default mb-2" id={"password-hint"}>
                  {t("signUpRegistration.fields.password.hintList.title")}
                  <ul className="mt-2">
                    <li>{t("signUpRegistration.fields.password.hintList.characters")}</li>
                    <li>{t("signUpRegistration.fields.password.hintList.number")}</li>
                    <li>{t("signUpRegistration.fields.password.hintList.capital")}</li>
                    <li>{t("signUpRegistration.fields.password.hintList.symbol")}</li>
                  </ul>
                </div>
                <TextInput
                  className="h-10 w-full max-w-lg rounded"
                  type={"password"}
                  id={"password"}
                  name={"password"}
                  ariaDescribedBy={"password-hint"}
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
              <p className="-mt-2 mb-10">
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
    </>
  );
};

Register.getLayout = (page: ReactElement) => {
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
          "cognito-errors",
          "signup",
          "auth-verify",
        ]))),
    },
  };
};

export default Register;
