import React from "react";
import { useTranslation } from "next-i18next";
import { SubNavLink } from "./SubNavLink";
import { useActivePathname } from "@components/form-builder/hooks";
import { LangSwitcher } from "../shared/LangSwitcher";

export const EditNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { activePathname } = useActivePathname();

  return (
    <div className="relative flex">
      <nav className="mb-8 flex divide-x-2 divide-gray-600" aria-label={t("navLabelEditor")}>
        <SubNavLink href="/form-builder/edit">
          <>{t("questions")}</>
        </SubNavLink>
        <SubNavLink href="/form-builder/edit/translate">
          <>{t("translate")}</>
        </SubNavLink>
      </nav>
      {activePathname.endsWith("/edit") && (
        <div className="absolute right-0 mr-24 top-0">
          <LangSwitcher descriptionLangKey="editingIn" />
        </div>
      )}
    </div>
  );
};
