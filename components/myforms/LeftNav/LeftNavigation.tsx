import React from "react";
import { NavLink } from "@components/globals/NavLink";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { PageIcon, GlobeIcon, FolderIcon } from "@components/form-builder/icons";

export const LeftNavigation = () => {
  const { t, i18n } = useTranslation(["my-forms", "form-builder"]);
  const router = useRouter();
  const path = String(router.query?.path);

  const iconClassname =
    "inline-block w-6 h-6 group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="absolute">
      <ul className="m-0 list-none p-0">
        <li>
          <NavLink
            id="tab-drafts"
            href={`/${i18n.language}/myforms/drafts`}
            isActive={path === "drafts"}
          >
            <PageIcon className={iconClassname} />
            {t("nav.drafts")}
          </NavLink>
        </li>
        <li>
          <NavLink
            id="tab-published"
            href={`/${i18n.language}/myforms/published`}
            isActive={path === "published"}
          >
            <GlobeIcon className={iconClassname} />
            {t("nav.published")}
          </NavLink>
        </li>
        <li>
          <NavLink id="tab-all" href={`/${i18n.language}/myforms/all`} isActive={path === "all"}>
            <FolderIcon className={iconClassname} />
            {t("nav.all")}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
