import React from "react";
import { RichText } from "@components/forms";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import Head from "next/head";

interface SLAProps {
  content: string;
}

const SLA = ({ content }: SLAProps) => {
  const { t } = useTranslation(["sla", "common"]);
  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <RichText>{content}</RichText>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const SLAContent = await require(`../public/static/content/${locale}/sla.md`);
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "sla"]))),
      content: SLAContent,
    },
  };
};

export default SLA;
