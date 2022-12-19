import React from "react";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "@components/form-builder/store";
import { ToggleLeft, ToggleRight } from "@components/form-builder/icons";

export const PreviewNavigation = () => {
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
    <div className="relative">
      <div className="absolute right-0 top-0 flex items-baseline">
        <span id="switch-heading" className="font-bold text-sm mr-1" aria-hidden="true">
          {t("previewingIn")}
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
        >
          <span
            id="switch-english"
            className="text-sm"
            aria-label={`${t("previewingIn")} ${t("English")}`}
          >
            {t("English")}{" "}
          </span>
          {translationLanguagePriority === "en" && (
            <ToggleLeft className="inline-block w-12 fill-violet-300" />
          )}
          {translationLanguagePriority === "fr" && (
            <ToggleRight className="inline-block w-12 fill-fuchsia-300" />
          )}
          <span
            id="switch-french"
            className="text-sm"
            aria-label={`${t("previewingIn")} ${t("French")}`}
          >
            {" "}
            {t("French")}
          </span>
        </div>
      </div>
    </div>
  );
};
