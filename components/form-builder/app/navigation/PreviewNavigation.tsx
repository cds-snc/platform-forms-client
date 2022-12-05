import React from "react";
import { useTranslation } from "next-i18next";
import { SubNavLink } from "./SubNavLink";
import { useTemplateStore } from "@components/form-builder/store";
import { Language } from "@components/form-builder/types";
import { useActivePathname } from "@components/form-builder/hooks";
import e from "cors";

export const PreviewNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { setTranslationLanguagePriority, translationLanguagePriority } = useTemplateStore((s) => ({
    setTranslationLanguagePriority: s.setTranslationLanguagePriority,
    translationLanguagePriority: s.translationLanguagePriority,
  }));
  const { activePathname } = useActivePathname();

  const switchLang = (lang: Language) => {
    setTranslationLanguagePriority(lang);
  };

  return (
    <div className="relative">
      <nav className="mb-8 flex divide-x-2 divide-gray-600" aria-label={t("navLabelPreview")}>
        <SubNavLink href="/form-builder/preview">{t("preview")}</SubNavLink>
        <SubNavLink href="/form-builder/preview/test-data-delivery">{t("test")}</SubNavLink>
      </nav>
      {activePathname.endsWith("/preview") && (
        <div className="absolute right-0 top-0 mt-1">
          <label htmlFor="lang" className="font-bold">
            Preview language:{" "}
          </label>
          <select
            id="lang"
            value={translationLanguagePriority}
            onChange={(e) => switchLang(e.target.value as Language)}
          >
            <option value="en">English</option>
            <option value="fr">French</option>
          </select>
        </div>
      )}
    </div>
  );
};
