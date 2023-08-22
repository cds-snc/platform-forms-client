import React from "react";
import { RichText } from "@components/forms";
import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import frContent from "@content/fr/sla.md";
import enContent from "@content/en/sla.md";
import { logMessage } from "@lib/logger";

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang = params.lang;

  logMessage.debug(`SLA page lang: ${lang}`);

  const { t } = await serverTranslation(lang, ["sla"]);
  return {
    title: t("title"),
  };
}

interface SLAProps {
  params: { lang: string };
}

const SLA = async ({ params: { lang } }: SLAProps) => {
  return <RichText>{lang === "fr" ? frContent : enContent}</RichText>;
};

export default SLA;
