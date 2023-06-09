import React, { ReactElement } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getServerSession } from "next-auth/next";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";

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
      <h1 className="border-b-0 mt-6 mb-12">{t("title")}</h1>
      <div>
        <p className="mb-10 -mt-6">{t("sub-title")}</p>
        <Button type="button" onClick={() => signIn("google")}>
          {t("button.login")}
        </Button>
      </div>
    </>
  );
};

Login.getLayout = (page: ReactElement) => {
  return <UserNavLayout>{page}</UserNavLayout>;
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
