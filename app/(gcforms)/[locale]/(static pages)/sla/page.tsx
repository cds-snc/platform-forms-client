import React from "react";
import { RichText } from "@clientComponents/forms/RichText/RichText";
import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import frContent from "@content/fr/sla.md";
import enContent from "@content/en/sla.md";
import { languages } from "@i18n/settings";

export async function generateStaticParams() {
  return languages.map((lang) => ({
    locale: lang,
  }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation(["sla"], { lang: locale });
  return {
    title: t("title"),
  };
}

const SLA = async ({ params: { locale } }: { params: { locale: string } }) => {
  return (
    <RichText className="w-[100%] tablet:w-[90%] laptop:w-[70%]">
      {locale === "fr" ? frContent : enContent}
    </RichText>
  );
};

export default SLA;
