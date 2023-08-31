import React from "react";
import { RichText } from "@appComponents/forms/RichText/RichText";
import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import frContent from "@content/fr/sla.md";
import enContent from "@content/en/sla.md";

interface SLAProps {
  params: { locale: string };
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverTranslation(["sla"]);
  return {
    title: t("title"),
  };
}

const SLA = async ({ params: { locale } }: SLAProps) => {
  return <RichText>{locale === "fr" ? frContent : enContent}</RichText>;
};

export default SLA;
