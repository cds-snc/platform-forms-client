import React from "react";
import { RichText } from "@clientComponents/forms/RichText/RichText";
import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import frContent from "@content/fr/terms-and-conditions.md";
import enContent from "@content/en/terms-and-conditions.md";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation(["terms"], { lang: locale });
  return {
    title: t("terms-and-conditions.title"),
  };
}

const TermsAndConditions = async ({ params: { locale } }: { params: { locale: string } }) => {
  return (
    <RichText className="w-[100%] tablet:w-[90%] laptop:w-[70%]">
      {locale === "fr" ? frContent : enContent}
    </RichText>
  );
};

export default TermsAndConditions;
