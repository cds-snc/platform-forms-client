import React from "react";
import { RichText } from "../../../../../../../../components/clientComponents/forms/RichText/RichText";
import { AcceptButton } from "../client/AcceptButton";
import { serverTranslation } from "@i18n";
import enAcceptableUse from "@content/en/responsibilities.md";
import frAcceptableUse from "@content/fr/responsibilities.md";

export const AcceptableUseTerms = async ({ locale }: { locale: string }) => {
  const { t } = await serverTranslation("common", { lang: locale });
  const termsOfUseContent = locale === "fr" ? frAcceptableUse : enAcceptableUse;
  return (
    <>
      <h1 className="pb-2">{t("acceptableUsePage.welcome")}</h1>
      <RichText className="w-full pb-10">{termsOfUseContent}</RichText>
      <AcceptButton />
    </>
  );
};

export default AcceptableUseTerms;
