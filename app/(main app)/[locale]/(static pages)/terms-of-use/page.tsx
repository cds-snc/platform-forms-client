import React from "react";
import { RichText } from "@clientComponents/forms/RichText/RichText";
import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import frContent from "@content/fr/terms-of-use.md";
import enContent from "@content/en/terms-of-use.md";

interface TermsOfUseProps {
  params: {
    locale: string;
  };
}
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation(["terms"], { lang: locale });
  return {
    title: t("terms-of-use.title"),
  };
}

const TermsOfUse = async ({ params: { locale } }: TermsOfUseProps) => {
  return (
    <RichText className="w-[100%] tablet:w-[90%] laptop:w-[70%]">
      {locale === "fr" ? frContent : enContent}
    </RichText>
  );
};

export default TermsOfUse;
