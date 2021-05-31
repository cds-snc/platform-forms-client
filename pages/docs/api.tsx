import React from "react";
import { GetStaticProps } from "next";
import { RichText } from "../../components/forms/RichText/RichText";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

interface APIDocsProps {
  content: string;
}
const APIDocs = ({ content }: APIDocsProps): JSX.Element => <RichText>{content}</RichText>;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  const privacyContent = await require(`../../public/static/content/${locale}/api.md`);
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      content: privacyContent.default,
    },
  };
};

export default APIDocs;
