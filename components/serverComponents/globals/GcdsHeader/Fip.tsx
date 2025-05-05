import { type Language } from "@lib/types/form-builder-types";
import { customTranslate } from "@lib/i18nHelpers";

import { SignatureEn } from "./assets/SignatureEn";
import { SignatureFr } from "./assets/SignatureFr";

export const Fip = ({ language }: { language: Language }) => {
  const { t } = customTranslate("common");

  const link = t("fip.link", { lng: language });

  return (
    <div className="gcds-signature brand__signature">
      <a href={link}>{language === "fr" ? <SignatureFr /> : <SignatureEn />}</a>
    </div>
  );
};
