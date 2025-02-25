import React from "react";
import { RichText } from "@clientComponents/forms/RichText/RichText";
import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import frContent from "@content/fr/unable-to-process.md";
import enContent from "@content/en/unable-to-process.md";
import { languages } from "@i18n/settings";

export async function generateStaticParams() {
  return languages.map((lang) => ({
    locale: lang,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation(["unable-to-process"], { lang: locale });
  return {
    title: t("title"),
  };
}

const UnableToProcess = async (props: { params: Promise<{ locale: string }> }) => {
  const params = await props.params;

  const { locale } = params;

  return (
    <RichText className="w-full tablet:w-[90%] laptop:w-[70%]">
      {locale === "fr" ? frContent : enContent}
    </RichText>
  );
};

export default UnableToProcess;
