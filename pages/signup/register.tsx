import React, { ReactElement } from "react";
import { Formik } from "formik";
import { TextInput, Label, Alert, ErrorListItem, Description } from "@components/forms";
import { Button } from "@components/globals";
import { useAuth, useFlag } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Confirmation } from "@components/auth/Confirmation/Confirmation";
import * as Yup from "yup";
import { isValidGovEmail, isUpperCase, isLowerCase, isNumber, isSymbol } from "@lib/validation";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import Loader from "@components/globals/Loader";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import Head from "next/head";

const Register = () => {
  const { isLoading, status: registrationOpen } = useFlag("accountRegistration");
  const {
    username,
    password,
    needsConfirmation,
    cognitoError,
    cognitoErrorDescription,
    cognitoErrorCallToActionLink,
    cognitoErrorCallToActionText,
    cognitoErrorIsDismissible,
    resetCognitoErrorState,
    register,
  } = useAuth();
  const { t } = useTranslation(["signup", "common"]);

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
      .min(8, t("signUpRegistration.fields.password.error.minLength"))
      .max(50, t("signUpRegistration.fields.password.error.maxLength"))
      .test(
        "password-valid-lowerCase",
        t("signUpRegistration.fields.password.error.oneLowerCase"),
        (password = "") => isLowerCase(password)
      )
      .test(
        "password-valid-upperCase",
        t("signUpRegistration.fields.password.error.oneUpperCase"),
        (password = "") => isUpperCase(password)
      )
      .test(
        "password-valid-number",
        t("signUpRegistration.fields.password.error.oneNumber"),
        (password = "") => isNumber(password)
      )
      .test(
        "password-valid-symbol",
        t("signUpRegistration.fields.password.error.oneSymbol"),
        (password = "") => isSymbol(password)
      ),
    passwordConfirmation: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .oneOf(
        [Yup.ref("password"), null],
        t("signUpRegistration.fields.passwordConfirmation.error.mustMatch")
      ),
  });

  if (isLoading) {
    return (
      <>
        <Head>
          <title>{t("signUpRegistration.title")}</title>
        </Head>
        <Loader message={t("loading")} />
      </>
    );
  }

  if (!registrationOpen) {
    return <div>{t("registrationClosed")}</div>;
  }

  if (needsConfirmation) {
    return (
      <Confirmation
        username={username.current}
        password={password.current}
        confirmationAuthenticationFailedCallback={() => undefined}
        confirmationCallback={() => undefined}
      />
    );
  }

  return (
    <>
      <Head>
        <title>{t("signUpRegistration.title")}</title>
      </Head>
      <Formik
        initialValues={{ username: "", password: "", name: "" }}
        onSubmit={async (values, formikHelpers) => {
          username.current = values.username;
          password.current = values.password;
          await register({ ...values }, formikHelpers);
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchema}
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
            <h1>{t("signUpRegistration.title")}</h1>
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
                <Description className="text-p text-black-default" id={"username-hint"}>
                  {t("signUpRegistration.fields.username.hint")}
                </Description>
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
                  {t("signUpRegistration.fields.password.label")}
                </Label>
                <Description className="text-p text-black-default" id={"password-hint"}>
                  {t("signUpRegistration.fields.password.hint")}
                </Description>
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
                  {t("signUpRegistration.fields.passwordConfirmation.label")}
                </Label>
                <TextInput
                  className="h-10 w-full max-w-lg rounded"
                  type={"password"}
                  id={"passwordConfirmation"}
                  name={"passwordConfirmation"}
                />
              </div>
              <p className="mb-10 -mt-8 gc-description">
                {t("signUpRegistration.slaAgreement")}&nbsp;
                <Link href={"/sla"}>{t("signUpRegistration.slaAgreementLink")}</Link>
              </p>

              <Button className="gc-button--blue" type="submit">
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
        (await serverSideTranslations(context.locale, ["common", "cognito-errors", "signup"]))),
    },
  };
};

export default Register;
