import React from "react";
import { RichText } from "@components/forms";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import Head from "next/head";

interface TermsOfUseProps {
  content: string;
}

const TermsOfUse = ({ content }: TermsOfUseProps) => {
  const { t } = useTranslation(["terms"]);

  return (
    <>
      <Head>
        <title>{t("terms-of-use.title")}</title>
      </Head>
      <RichText>{content}</RichText>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const termsOfUseContent = await require(`../public/static/content/${locale}/terms-of-use.md`);

  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "terms"]))),
      content: termsOfUseContent,
    },
  };
};

export default TermsOfUse;
