import React from "react";
import { useTranslation } from "next-i18next";
import { SubNavLink } from "./SubNavLink";

export const EditNavigation = () => {
  const { t } = useTranslation("form-builder");

  return (
    <nav className="mb-8 flex divide-x-2 divide-gray-600" aria-label={t("navLabelEditor")}>
      <SubNavLink href="/form-builder/edit">{t("questions")}</SubNavLink>
      <SubNavLink href="/form-builder/translate">{t("translate")}</SubNavLink>
    </nav>
  );
};
