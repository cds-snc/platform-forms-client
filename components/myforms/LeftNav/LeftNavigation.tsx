import React from "react";
import { LeftNavLink } from "./LeftNavLink";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { PageIcon, GlobeIcon, FolderIcon } from "@components/form-builder/icons";

export const LeftNavigation = () => {
  const { t, i18n } = useTranslation(["my-forms", "form-builder"]);
  const router = useRouter();
  const path = String(router.query?.path);

  const iconClassname =
    "inline-block w-6 h-6 xl:block xl:mx-auto group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="absolute xl:content-center">
      <LeftNavLink
        id="tab-drafts"
        href={`/${i18n.language}/myforms/drafts`}
        isActive={path === "drafts"}
      >
        <>
          <PageIcon className={iconClassname} />
          {t("nav.drafts")}
        </>
      </LeftNavLink>

      <LeftNavLink
        id="tab-published"
        href={`/${i18n.language}/myforms/published`}
        isActive={path === "published"}
      >
        <>
          <GlobeIcon className={iconClassname} />
          {t("nav.published")}
        </>
      </LeftNavLink>

      <LeftNavLink id="tab-all" href={`/${i18n.language}/myforms/all`} isActive={path === "all"}>
        <>
          <FolderIcon className={iconClassname} />
          {t("nav.all")}
        </>
      </LeftNavLink>
    </nav>
  );
};
