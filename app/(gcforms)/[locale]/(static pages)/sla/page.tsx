import React from "react";
import { RichText } from "@clientComponents/forms/RichText/RichText";
import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import frContent from "@content/fr/sla.md";
import enContent from "@content/en/sla.md";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation(["sla"], { lang: locale });
  return {
    title: t("title"),
  };
}

const SLA = async (props: { params: Promise<{ locale: string }> }) => {
  const params = await props.params;

  const { locale } = params;

  return (
    <RichText className="w-full tablet:w-[90%] laptop:w-[70%]">
      {locale === "fr" ? frContent : enContent}
    </RichText>
  );
};

export default SLA;
