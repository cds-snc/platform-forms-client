import React from "react";
import { RichText } from "@appComponents/forms/RichText/RichText";
import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import frContent from "@content/fr/sla.md";
import enContent from "@content/en/sla.md";
import { logMessage } from "@lib/logger";

interface SLAProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: SLAProps): Promise<Metadata> {
  const lang = params.locale ?? "en";

  logMessage.debug(`SLA page lang: ${lang}`);

  const { t } = await serverTranslation(lang, ["sla"]);
  return {
    title: t("title"),
  };
}

const SLA = async ({ params: { locale } }: SLAProps) => {
  return <RichText>{locale === "fr" ? frContent : enContent}</RichText>;
};

export default SLA;
