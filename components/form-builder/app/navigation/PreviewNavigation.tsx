import React from "react";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "@components/form-builder/store";
import { useActivePathname } from "@components/form-builder/hooks";
import { useSession } from "next-auth/react";
import { ToggleLeft, ToggleRight } from "@components/form-builder/icons";
import { SubNavLink } from "./SubNavLink";

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
      <div className="absolute right-0 top-0">
        <label htmlFor="lang" className="font-bold text-sm">
          {t("previewingIn")}{" "}
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
    </div>
  );
};
