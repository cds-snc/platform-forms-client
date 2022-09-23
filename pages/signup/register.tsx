import React from "react";
import { Formik } from "formik";
import { Button, TextInput, Label } from "@components/forms";
import { useAuth } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Register() {
  const { register } = useAuth();
  const { t } = useTranslation();
  return (
    <Formik initialValues={{ username: "", password: "" }} onSubmit={register}>
      {({ handleSubmit }) => (
        <>
          <h1>Sign up to GC Forms</h1>
          <form id="registration" method="POST" onSubmit={handleSubmit}>
            <div className="focus-group">
              <Label id={"label-1"} htmlFor={"1"} className="required">
                Email
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
                Password
              </Label>
              <TextInput
                type={"password"}
                id={"2"}
                name={"password"}
                characterCountMessages={{
                  part1: t("formElements.characterCount.part1"),
                  part2: t("formElements.characterCount.part2"),
                  part1Error: t("formElements.characterCount.part1-error"),
                  part2Error: t("formElements.characterCount.part2-error"),
                }}
              />
            </div>
            <div className="buttons">
              <Button type="submit">{t("submitButton")}</Button>
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
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "welcome", "confirmation"]))),
    },
  };
};
