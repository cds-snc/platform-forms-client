import React from "react";
import { RichText } from "@components/forms";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import Head from "next/head";

interface TermsAndConditionsProps {
  content: string;
}

const TermsAndConditions = ({ content }: TermsAndConditionsProps) => {
  const { t } = useTranslation(["terms"]);

  return (
    <>
      <Head>
        <title>{t("terms-and-conditions.title")}</title>
      </Head>
      <RichText>{content}</RichText>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const termsAndConditionsContent =
    await require(`../../public/static/content/${locale}/terms-and-conditions.md`);

  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "terms"]))),
      content: termsAndConditionsContent,
    },
  };
};

export default TermsAndConditions;
