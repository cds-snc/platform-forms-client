import React from "react";
import { useTranslation } from "next-i18next";
import { SubNavLink } from "@components/form-builder/app/navigation/SubNavLink";

import { PageIcon, GlobeIcon, FolderIcon } from "@components/form-builder/icons";

export const FilterNavigation = () => {
  const { t, i18n } = useTranslation(["my-forms", "form-builder"]);

  const iconClassname =
    "inline-block w-6 h-6 group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="flex flex-wrap laptop:mb-4" aria-label={t("navLabelEditor")}>
      <SubNavLink href={`/${i18n.language}/forms`}>
        <>
          <FolderIcon className={iconClassname} />
          {t("nav.all")}
        </>
      </SubNavLink>

      <SubNavLink href={`/${i18n.language}/forms/drafts`}>
        <>
          <PageIcon className={iconClassname} />
          {t("nav.drafts")}
        </>
      </SubNavLink>

      <SubNavLink href={`/${i18n.language}/forms/published`}>
        <>
          <GlobeIcon className={iconClassname} />
          {t("nav.published")}
        </>
      </SubNavLink>
    </nav>
  );
};
