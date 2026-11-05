import React from "react";
import { RichText } from "@clientComponents/forms/RichText/RichText";
import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import frContent from "@content/fr/terms-of-use.md";
import enContent from "@content/en/terms-of-use.md";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

interface TermsOfUseProps {
  params: Promise<{
    locale: string;
  }>;
}
export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation(["terms"], { lang: locale });
  return {
    title: t("terms-of-use.title"),
  };
}

const TermsOfUse = async (props: TermsOfUseProps) => {
  const params = await props.params;

  const { locale } = params;

  return <RichText>{locale === "fr" ? frContent : enContent}</RichText>;
};

export default TermsOfUse;
