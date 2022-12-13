import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { unstable_getServerSession } from "next-auth/next";
import { useTranslation } from "next-i18next";
import { authOptions } from "@pages/api/auth/[...nextauth]";

const Unauthorized: React.FC = () => {
  const { t } = useTranslation("admin-login");
  return (
    <>
      <Head>
        <title>{t("unauthorized.title")}</title>
      </Head>
      <h1>{t("unauthorized.title")}</h1>
      <div className="mt-4">{t("unauthorized.detail")}</div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions);

  if (!session)
    return {
      redirect: {
        destination: `/${context.locale}/admin/login/`,
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

export default Unauthorized;
