import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { GetStaticProps } from "next";

import { ErrorPanel } from "@components/globals";

const PageNotFound = () => {
  const { t } = useTranslation("error");
  return (
    <>
      <Head>
        <title>{t("404.title")}</title>
      </Head>
      <div className="mt-10">
        <ErrorPanel headingTag="h1" title={t("404.title")}>
          <p>{t("404.body")}</p>
        </ErrorPanel>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { locale = "en" }: { locale?: string } = params ?? {};
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "error"])),
    },
  };
};

export default PageNotFound;
