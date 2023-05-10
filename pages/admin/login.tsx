import { GetServerSideProps } from "next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getServerSession } from "next-auth/next";

import React from "react";
import { useTranslation } from "next-i18next";
import { signIn } from "next-auth/react";

import { Button } from "@components/globals";
import { authOptions } from "@pages/api/auth/[...nextauth]";

const Login = (): JSX.Element => {
  const { t } = useTranslation("admin-login");

  return (
    <>
      <Head>
        <title>{`${t("title")}: ${t("sub-title")}`}</title>
      </Head>
      <h1>{t("title")}</h1>
      <div>
        <h2 className="pb-10">{t("sub-title")}</h2>
        <Button type="button" onClick={() => signIn("google")}>
          {t("button.login")}
        </Button>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session)
    return {
      redirect: {
        destination: `/${context.locale}/admin/`,
        permanent: false,
      },
    };

  if (session)
    return {
      redirect: {
        destination: `/${context.locale}/admin/unauthorized/`,
        permanent: false,
      },
    };

  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "admin-login"]))),
    },
  };
};

export default Login;
