import React from "react";
import { useTranslation } from "next-i18next";
import { SubNavLink } from "./SubNavLink";
import { useTemplateStore } from "@components/form-builder/store";

export const EditNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { setTranslationLanguagePriority } = useTemplateStore((s) => ({
    setTranslationLanguagePriority: s.setTranslationLanguagePriority,
  }));

  const switchLang = (lang: string) => {
    setTranslationLanguagePriority(lang);
  };

  return (
    <div className="relative">
      <nav className="mb-8 flex divide-x-2 divide-gray-600" aria-label={t("navLabelEditor")}>
        <SubNavLink href="/form-builder/edit">{t("questions")}</SubNavLink>
        <SubNavLink href="/form-builder/edit/translate">{t("translate")}</SubNavLink>
      </nav>
      <div className="absolute right-0 mr-24 top-0">
        <label htmlFor="lang" className="font-bold">
          Currently editing:{" "}
        </label>
        <select id="lang" onChange={(e) => switchLang(e.target.value)}>
          <option value="en">English</option>
          <option value="fr">French</option>
        </select>
      </div>
    </div>
  );
};
