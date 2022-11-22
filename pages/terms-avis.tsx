import React from "react";
import { RichText } from "@components/forms";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";

interface TermsProps {
  content: string;
}

const Terms = ({ content }: TermsProps) => <RichText>{content}</RichText>;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const termsContent = await require(`../public/static/content/${locale}/terms.md`);
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common"]))),
      content: termsContent,
    },
  };
};

export default Terms;
