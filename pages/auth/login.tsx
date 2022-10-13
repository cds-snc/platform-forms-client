import React from "react";
import { Formik } from "formik";
import { Button, TextInput, Label, Alert, ErrorListItem } from "@components/forms";
import { useAuth } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { UserRole } from "@prisma/client";
import { Confirmation } from "@components/auth/Confirmation/Confirmation";

export default function Register() {
  const { username, cognitoError, setCognitoError, login } = useAuth();
  const { t } = useTranslation(["login", "common"]);
  if (username) {
    return <Confirmation username={username} />;
  }
  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      onSubmit={async (values, helpers) => {
        await login(values, helpers);
      }}
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
          <form id="login" method="POST" onSubmit={handleSubmit}>
            <div className="focus-group">
              <Label id={"label-1"} htmlFor={"1"} className="required">
                {t("fields.username.label")}
              </Label>
              <TextInput type={"email"} id={"1"} name={"username"} />
            </div>
            <div className="focus-group">
              <Label id={"label-1"} htmlFor={"1"} className="required">
                {t("fields.password.label")}
              </Label>
              <TextInput type={"password"} id={"2"} name={"password"} />
            </div>
            <div className="buttons">
              <Button type="submit">{t("submitButton", { ns: "common" })}</Button>
            </div>
            <Link href={"/signup/register"}>{t("signUpLink")}</Link>
          </form>
        </>
      )}
    </Formik>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions);

  if (session?.user.role === UserRole.ADMINISTRATOR)
    return {
      props: {},
      redirect: {
        destination: `/${context.locale}/admin/`,
        permanent: false,
      },
    };

  if (session)
    return {
      props: {},
      redirect: {
        destination: `/${context.locale}/admin/unauthorized/`,
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
