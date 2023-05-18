import React, { ReactElement } from "react";
import { Formik } from "formik";
import { TextInput, Label } from "@components/forms";
import { Button } from "@components/globals";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import { signIn } from "next-auth/react";
import { logMessage } from "@lib/logger";

const Login = () => {
  return (
    <>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values) => {
          values.username;
          values.password;
          logMessage.debug(values);
          await signIn("cognito", {
            username: values.username,
            verificationCode: values.password,
            callbackUrl: "/auth/policy",
          });
        }}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ handleSubmit }) => (
          <>
            <form id="login" method="POST" onSubmit={handleSubmit} noValidate>
              <div className="focus-group">
                <Label id={"label-username"} htmlFor={"username"} className="required" required>
                  {"fields.username.label"}
                </Label>
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
                  {"fields.password.label"}
                </Label>
                <TextInput
                  className="h-10 w-full max-w-lg rounded"
                  type={"password"}
                  id={"password"}
                  name={"password"}
                  required
                />
              </div>

              <Button className="gc-button--blue" type="submit">
                {"signInButton"}
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
