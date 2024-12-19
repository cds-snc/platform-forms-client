import React from "react";
import { RichText } from "@clientComponents/forms/RichText/RichText";
import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import frContent from "@content/fr/terms-of-use.md";
import enContent from "@content/en/terms-of-use.md";

import { languages } from "@i18n/settings";

export async function generateStaticParams() {
  return languages.map((lang) => ({
    locale: lang,
  }));
}

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

  return (
    <RichText className="w-[100%] tablet:w-[90%] laptop:w-[70%]">
      {locale === "fr" ? frContent : enContent}
    </RichText>
  );
};

export default TermsOfUse;
