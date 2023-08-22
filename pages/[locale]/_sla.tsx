import React from "react";
import { RichText } from "@components/forms";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
import { logMessage } from "@lib/logger";

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

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          locale: "en",
        },
      },
      {
        params: {
          locale: "fr",
        },
      },
    ],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { locale = "en" }: { locale?: string } = params ?? {};
  logMessage.debug(`SLA page lang: ${locale}`);
  const SLAContent = await require(`../../public/static/content/${locale}/sla.md`);
  return {
    props: {
      ...(params?.locale && (await serverSideTranslations(locale, ["common", "sla"]))),
      content: SLAContent,
    },
  };
};

export default SLA;
