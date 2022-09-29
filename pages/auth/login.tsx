import React, { useState } from "react";
import { Formik } from "formik";
import { Button, TextInput, Label } from "@components/forms";
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
  const { login } = useAuth();
  const { t } = useTranslation(["login", "common"]);
  const [username, setUsername] = useState("");
  if (username) {
    return <Confirmation username={username} />;
  }
  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      onSubmit={async (values, helpers) => {
        await login(values, helpers, setUsername);
      }}
    >
      {({ handleSubmit }) => (
        <>
          <h1>{t("title")}</h1>
          <form id="login" method="POST" onSubmit={handleSubmit}>
            <div className="focus-group">
              <Label id={"label-1"} htmlFor={"1"} className="required">
                {t("fields.username.label")}
              </Label>
              <TextInput
                type={"email"}
                id={"1"}
                name={"username"}
                characterCountMessages={{
                  part1: t("formElements.characterCount.part1", { ns: "common" }),
                  part2: t("formElements.characterCount.part2", { ns: "common" }),
                  part1Error: t("formElements.characterCount.part1-error", { ns: "common" }),
                  part2Error: t("formElements.characterCount.part2-error", { ns: "common" }),
                }}
              />
            </div>
            <div className="focus-group">
              <Label id={"label-1"} htmlFor={"1"} className="required">
                {t("fields.password.label")}
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
        (await serverSideTranslations(context.locale, ["common", "signup", "login"]))),
    },
  };
};
