import React from "react";
import { RichText } from "@components/forms";
import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import frContent from "@content/fr/terms-of-use.md";
import enContent from "@content/en/terms-of-use.md";

interface TermsOfUseProps {
  params: {
    lang: string;
  };
}
export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang = params.lang;

  const { t } = await serverTranslation(lang, ["terms"]);
  return {
    title: t("terms-of-use.title"),
  };
}

const TermsOfUse = async ({ params: { lang } }: TermsOfUseProps) => {
  return <RichText>{lang === "fr" ? frContent : enContent}</RichText>;
};

export default TermsOfUse;
