import React from "react";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import Head from "next/head";

const PageNotFound = () => {
  const { t, i18n } = useTranslation("error");
  return (
    <>
      <Head>
        <title>{t("404.title")}</title>
      </Head>
      <h1>{t("404.title")}</h1>

      <div>
        <p>{t("404.body")}</p>
        <Link href={t("home-link.link")} locale={i18n.language}>
          {t("home-link.desc")}
        </Link>
      </div>
    </>
  );
};

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common", "error"])),
  },
});

export default PageNotFound;
