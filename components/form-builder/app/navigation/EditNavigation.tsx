import React from "react";
import { useTranslation } from "next-i18next";
import { SubNavLink } from "./SubNavLink";
import { useTemplateStore } from "@components/form-builder/store";
import { useActivePathname } from "@components/form-builder/hooks";
import { ToggleLeft, ToggleRight } from "@components/form-builder/icons";

export const EditNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { toggleTranslationLanguagePriority, translationLanguagePriority } = useTemplateStore(
    (s) => ({
      translationLanguagePriority: s.translationLanguagePriority,
      toggleTranslationLanguagePriority: s.toggleTranslationLanguagePriority,
    })
  );
  const { activePathname } = useActivePathname();

  const switchLang = () => {
    toggleTranslationLanguagePriority();
  };

  return (
    <div className="relative">
      <nav className="mb-8 flex divide-x-2 divide-gray-600" aria-label={t("navLabelEditor")}>
        <SubNavLink href="/form-builder/edit">{t("questions")}</SubNavLink>
        <SubNavLink href="/form-builder/edit/translate">{t("translate")}</SubNavLink>
      </nav>
      {activePathname.endsWith("/edit") && (
        <div className="absolute right-0 mr-24 top-0">
          <label htmlFor="lang" className="font-bold text-sm">
            {t("editingIn")}{" "}
          </label>
          <label htmlFor="lang" className="text-sm">
            {t("English")}
          </label>{" "}
          {translationLanguagePriority === "fr" && (
            <button id="lang" onClick={() => switchLang()}>
              <ToggleRight className="inline-block w-12 fill-fuchsia-300" />
            </button>
          )}
          {translationLanguagePriority === "en" && (
            <button id="lang" onClick={() => switchLang()}>
              <ToggleLeft className="inline-block w-12 fill-violet-300" />
            </button>
          )}{" "}
          <label htmlFor="lang" className="text-sm">
            {t("French")}
          </label>
        </div>
      )}
    </div>
  );
};
