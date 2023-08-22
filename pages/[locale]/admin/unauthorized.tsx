import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getServerSession } from "next-auth/next";
import { useTranslation } from "next-i18next";
import { authOptions } from "@app/api/auth/authConfig";

import { ErrorPanel } from "@components/globals";

const Unauthorized: React.FC = () => {
  const { t } = useTranslation("admin-login");
  return (
    <>
      <Head>
        <title>{t("unauthorized.title")}</title>
      </Head>
      <div className="mt-10">
        <ErrorPanel headingTag="h1" title={t("unauthorized.title")}>
          <p>{t("unauthorized.detail")}</p>
        </ErrorPanel>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session)
    return {
      redirect: {
        destination: `/${context.locale}/auth/login/`,
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
