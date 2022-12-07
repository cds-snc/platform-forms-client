import React from "react";
import { useTranslation } from "next-i18next";
import { SubNavLink } from "./SubNavLink";
import { useTemplateStore } from "@components/form-builder/store";
import { useActivePathname } from "@components/form-builder/hooks";
import { useSession } from "next-auth/react";
import { ToggleLeft, ToggleRight } from "@components/form-builder/icons";

export const PreviewNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { toggleTranslationLanguagePriority, translationLanguagePriority } = useTemplateStore(
    (s) => ({
      translationLanguagePriority: s.translationLanguagePriority,
      toggleTranslationLanguagePriority: s.toggleTranslationLanguagePriority,
    })
  );
  const { activePathname } = useActivePathname();
  const { status } = useSession();

  const switchLang = () => {
    toggleTranslationLanguagePriority();
  };

  return (
    <div className="relative">
      {status === "authenticated" && (
        <nav className="mb-8 flex divide-x-2 divide-gray-600" aria-label={t("navLabelPreview")}>
          <SubNavLink href="/form-builder/preview">{t("preview")}</SubNavLink>
          <SubNavLink href="/form-builder/preview/test-data-delivery">{t("test")}</SubNavLink>
        </nav>
      )}
      {activePathname.endsWith("/preview") && (
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
      )}
    </div>
  );
};
