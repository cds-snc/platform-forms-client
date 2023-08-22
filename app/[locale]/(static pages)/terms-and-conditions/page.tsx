import React from "react";
import { RichText } from "@components/forms";
import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import frContent from "@content/fr/terms-and-conditions.md";
import enContent from "@content/en/terms-and-conditions.md";

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang = params.lang;

  const { t } = await serverTranslation(lang, ["terms"]);
  return {
    title: t("terms-and-conditions.title"),
  };
}

const TermsAndConditions = async ({ params: { lang } }: { params: { lang: string } }) => {
  return <RichText>{lang === "fr" ? frContent : enContent}</RichText>;
};

export default TermsAndConditions;
