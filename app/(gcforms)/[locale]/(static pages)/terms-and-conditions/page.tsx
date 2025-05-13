import React from "react";
import { RichText } from "@clientComponents/forms/RichText/RichText";
import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import frContent from "@content/fr/terms-and-conditions.md";
import enContent from "@content/en/terms-and-conditions.md";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation(["terms"], { lang: locale });
  return {
    title: t("terms-and-conditions.title"),
  };
}

const TermsAndConditions = async (props: { params: Promise<{ locale: string }> }) => {
  const params = await props.params;

  const { locale } = params;

  return <RichText>{locale === "fr" ? frContent : enContent}</RichText>;
};

export default TermsAndConditions;
