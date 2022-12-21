import React from "react";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "@components/form-builder/store";
import { ToggleLeft, ToggleRight } from "@components/form-builder/icons";

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
        className="font-bold text-sm whitespace-nowrap mr-2"
        aria-hidden="true"
      >
        {t(descriptionLangKey)}
      </span>
      <div
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
        className="whitespace-nowrap cursor-pointer"
      >
        <span
          id="switch-english"
          className="text-sm mr-1"
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
          className="text-sm ml-1"
          aria-label={`${t(descriptionLangKey)} ${t("french")}`}
        >
          {t("french")}
        </span>
      </div>
    </div>
  );
};
