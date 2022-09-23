import React from "react";
import { Formik } from "formik";
import { Button, TextInput, Label } from "@components/forms";
import { useAuth } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Confirm({ username }: { username: string | undefined }) {
  const { confirm } = useAuth();
  const { t } = useTranslation();
  if (!username) {
    return <p>No user to confirm</p>;
  }

  return (
    <Formik initialValues={{ username: username, confirmationCode: "" }} onSubmit={confirm}>
      {({ handleSubmit }) => (
        <>
          <h1>Confirm your email</h1>
          <form id="confirmation" method="POST" onSubmit={handleSubmit}>
            <div className="focus-group">
              <Label id={"label-1"} htmlFor={"1"} className="required">
                Confirmation Code
              </Label>
              <TextInput
                type={"text"}
                id={"1"}
                name={"confirmationCode"}
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
      username: context.query.username,
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "welcome", "confirmation"]))),
    },
  };
};
