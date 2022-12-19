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
    <div className="relative flex">
      <nav className="mb-8 flex divide-x-2 divide-gray-600" aria-label={t("navLabelEditor")}>
        <SubNavLink href="/form-builder/edit">{t("questions")}</SubNavLink>
        <SubNavLink href="/form-builder/edit/translate">{t("translate")}</SubNavLink>
      </nav>
      {activePathname.endsWith("/edit") && (
        <div className="absolute right-0 mr-24 top-0 flex items-baseline">
          <span id="switch-heading" className="font-bold text-sm mr-1" aria-hidden="true">
            {t("editingIn")}{" "}
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
              aria-label={`${t("editingIn")} ${t("English")}`}
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
              aria-label={`${t("editingIn")} ${t("French")}`}
            >
              {" "}
              {t("French")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
