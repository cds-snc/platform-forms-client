import React, { ReactElement } from "react";
import { Formik } from "formik";
import { Button, TextInput, Label, Alert, ErrorListItem } from "@components/forms";
import { useAuth, useFlag } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { Confirmation } from "@components/auth/Confirmation/Confirmation";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import * as Yup from "yup";

const Register = () => {
  const { username, cognitoError, setCognitoError, login } = useAuth();
  const { t } = useTranslation(["login", "common"]);
  const registrationOpen = useFlag("accountRegistration");

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .email(t("input-validation.email", { ns: "common" })),
    password: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .max(50, t("fields.password.errors.maxLength")),
  });

  if (username) {
    return <Confirmation username={username} />;
  }
  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      onSubmit={async (values, helpers) => {
        await login(values, helpers);
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
              onDismiss={() => {
                setCognitoError("");
              }}
              id="cognitoErrors"
              dismissible
            />
          )}
          {Object.keys(errors).length > 0 && !cognitoError && (
            <Alert
              type="error"
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
          <form id="login" method="POST" onSubmit={handleSubmit} noValidate>
            <div className="focus-group">
              <Label id={"label-username"} htmlFor={"username"} className="required">
                {t("fields.username.label")}
              </Label>
              <TextInput type={"email"} id={"username"} name={"username"} />
            </div>
            <div className="focus-group">
              <Label id={"label-password"} htmlFor={"password"} className="required">
                {t("fields.password.label")}
              </Label>
              <TextInput type={"password"} id={"password"} name={"password"} />
            </div>
            <div className="buttons">
              <Button type="submit">{t("submitButton", { ns: "common" })}</Button>
            </div>
            {registrationOpen && <Link href={"/signup/register"}>{t("signUpLink")}</Link>}
          </form>
        </>
      )}
    </Formik>
  );
};

Register.getLayout = (page: ReactElement) => {
  return <UserNavLayout>{page}</UserNavLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions);

  if (session)
    return {
      props: {},
      redirect: {
        destination: `/${context.locale}/admin/`,
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

export default Register;
