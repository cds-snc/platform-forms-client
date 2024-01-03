import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { serverTranslation } from "@i18n";
import { getServerSession } from "next-auth/next";
import { useTranslation } from "@i18n/client";
import { authOptions } from "@app/api/auth/authConfig";

import { ErrorPanel } from "@clientComponents/globals";

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

  const { locale = "en" }: { locale?: string } = context.params ?? {};

  if (!session)
    return {
      redirect: {
        destination: `/${locale}/auth/login/`,
        permanent: false,
      },
    };

  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "admin-login"]))),
    },
  };
};

export default Unauthorized;
