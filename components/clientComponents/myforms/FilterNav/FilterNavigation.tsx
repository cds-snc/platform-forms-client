"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { SubNavLink } from "@clientComponents/form-builder/app/navigation/SubNavLink";

import { PageIcon, GlobeIcon, FolderIcon } from "@serverComponents/icons";

export const FilterNavigation = () => {
  const { t, i18n } = useTranslation(["my-forms", "form-builder"]);

  const iconClassname =
    "inline-block w-6 h-6 group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="flex flex-wrap laptop:mb-4" aria-label={t("navLabel")}>
      <SubNavLink href={`/${i18n.language}/forms`} setAriaCurrent={true} id="tab-all">
        <>
          <FolderIcon className={iconClassname} />
          {t("nav.all")}
        </>
      </SubNavLink>

      <SubNavLink href={`/${i18n.language}/forms/drafts`} setAriaCurrent={true} id="tab-drafts">
        <>
          <PageIcon className={iconClassname} />
          {t("nav.drafts")}
        </>
      </SubNavLink>

      <SubNavLink
        href={`/${i18n.language}/forms/published`}
        setAriaCurrent={true}
        id="tab-published"
      >
        <>
          <GlobeIcon className={iconClassname} />
          {t("nav.published")}
        </>
      </SubNavLink>
    </nav>
  );
};
