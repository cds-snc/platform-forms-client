import React, { useState } from "react";
import { Formik } from "formik";
import { Button, TextInput, Label } from "@components/forms";
import { useAuth } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Confirmation } from "@components/auth/Confirmation/Confirmation";

export default function Register() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const { t } = useTranslation(["signup", "common"]);
  if (username) {
    return <Confirmation username={username} />;
  }
  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      onSubmit={async (values, formikHelpers) => {
        await register(values, formikHelpers, setUsername);
      }}
    >
      {({ handleSubmit }) => (
        <>
          <h1>{t("signUpRegistration.title")}</h1>
          <form id="registration" method="POST" onSubmit={handleSubmit}>
            <div className="focus-group">
              <Label id={"label-1"} htmlFor={"1"} className="required">
                {t("signUpRegistration.fields.username.label")}
              </Label>
              <TextInput
                type={"email"}
                id={"1"}
                name={"username"}
                characterCountMessages={{
                  part1: t("formElements.characterCount.part1"),
                  part2: t("formElements.characterCount.part2"),
                  part1Error: t("formElements.characterCount.part1-error"),
                  part2Error: t("formElements.characterCount.part2-error"),
                }}
              />
            </div>
            <div className="focus-group">
              <Label id={"label-1"} htmlFor={"1"} className="required">
                {t("signUpRegistration.fields.password.label")}
              </Label>
              <TextInput
                type={"password"}
                id={"2"}
                name={"password"}
                characterCountMessages={{
                  part1: t("formElements.characterCount.part1", { ns: "common" }),
                  part2: t("formElements.characterCount.part2", { ns: "common" }),
                  part1Error: t("formElements.characterCount.part1-error", { ns: "common" }),
                  part2Error: t("formElements.characterCount.part2-error", { ns: "common" }),
                }}
              />
            </div>
            <div className="buttons">
              <Button type="submit">{t("submitButton", { ns: "common" })}</Button>
            </div>
          </form>
        </>
      )}
    </Formik>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(context.locale && (await serverSideTranslations(context.locale, ["common", "signup"]))),
    },
  };
};
