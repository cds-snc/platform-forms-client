import React from "react";
import { RichText } from "@components/forms";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";

interface SLAProps {
  content: string;
}

const SLA = ({ content }: SLAProps) => <RichText>{content}</RichText>;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const SLAContent = await require(`../public/static/content/${locale}/sla.md`);
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common"]))),
      content: SLAContent,
    },
  };
};

export default SLA;
