import React, { ReactElement } from "react";
import axios from "axios";
import { getCsrfToken } from "next-auth/react";
import { Formik } from "formik";
import { TextInput, Label } from "@components/forms";
import { Button } from "@components/globals";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import { logMessage } from "@lib/logger";

const Login = () => {
  return (
    <>
      <Formik
        initialValues={{ username: "", verificationCode: "" }}
        onSubmit={async (values) => {
          values.username;
          values.verificationCode;
          const { data } = await axios({
            url: "/api/auth/callback/cognito",
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            data: new URLSearchParams({
              username: values.username,
              verificationCode: values.verificationCode,
              csrfToken: (await getCsrfToken()) ?? "noToken",
              json: "true",
            }),
            timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
          });
          logMessage.debug(data);
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
                <Label
                  id={"label-verificationCode"}
                  htmlFor={"verificationCode"}
                  className="required"
                  required
                >
                  {"fields.verificationCode.label"}
                </Label>
                <TextInput
                  className="h-10 w-full max-w-lg rounded"
                  type={"password"}
                  id={"verificationCode"}
                  name={"verificationCode"}
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
