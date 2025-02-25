"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { ToggleLeft, ToggleRight } from "@serverComponents/icons";

interface LangSwitcherProps {
  descriptionLangKey: string;
}

export const LangSwitcher = (props: LangSwitcherProps) => {
  const { descriptionLangKey } = props;
  const { t } = useTranslation("form-builder");
  const { toggleTranslationLanguagePriority, translationLanguagePriority } = useTemplateStore(
    (s) => ({
      translationLanguagePriority: s.translationLanguagePriority,
      toggleTranslationLanguagePriority: s.toggleTranslationLanguagePriority,
    })
  );

  const switchLang = () => {
    toggleTranslationLanguagePriority();
  };

  return (
    <div className="flex items-baseline">
      <span
        id="switch-heading"
        className="mr-2 whitespace-nowrap text-sm font-bold"
        aria-hidden="true"
      >
        {t(descriptionLangKey)}
      </span>
      <div
        data-testid="lang-switcher"
        role="button spinbutton"
        tabIndex={0}
        aria-activedescendant={
          translationLanguagePriority === "en" ? "switch-english" : "switch-french"
        }
        onClick={() => switchLang()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            switchLang();
          }
        }}
        className="cursor-pointer whitespace-nowrap"
      >
        <span
          id="switch-english"
          className="mr-1 text-sm"
          aria-label={`${t(descriptionLangKey)} ${t("english")}`}
        >
          {t("english")}
        </span>
        {translationLanguagePriority === "en" && (
          <ToggleLeft className="inline-block w-12 fill-violet-300" />
        )}
        {translationLanguagePriority === "fr" && (
          <ToggleRight className="inline-block w-12 fill-fuchsia-300" />
        )}
        <span
          id="switch-french"
          className="ml-1 text-sm"
          aria-label={`${t(descriptionLangKey)} ${t("french")}`}
        >
          {t("french")}
        </span>
      </div>
    </div>
  );
};
