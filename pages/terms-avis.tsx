import React from "react";
import { RichText } from "@components/forms";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import Head from "next/head";

interface TermsProps {
  content: string;
}

const Terms = ({ content }: TermsProps) => {
  const { t } = useTranslation(["terms", "common"]);
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
  const termsContent = await require(`../public/static/content/${locale}/terms.md`);
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "terms"]))),
      content: termsContent,
    },
  };
};

export default Terms;
