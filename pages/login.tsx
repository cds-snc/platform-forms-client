import React from "react";
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

export default function Register() {
  const { login } = useAuth();
  const { t } = useTranslation();
  return (
    <Formik initialValues={{ username: "", password: "" }} onSubmit={login}>
      {({ handleSubmit }) => (
        <>
          <h1>Sign In to GC Forms</h1>
          <form id="login" method="POST" onSubmit={handleSubmit}>
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
            <Link href={"/signup/register"}>Sign Up to GC Forms</Link>
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
        (await serverSideTranslations(context.locale, ["common", "welcome", "confirmation"]))),
    },
  };
};
