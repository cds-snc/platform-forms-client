import React from "react";
import { LeftNavLink } from "./LeftNavLink";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useAccessControl } from "@lib/hooks";

import {
  NameIcon,
  FlagIcon,
  PageIcon,
  TreeViewIcon,
  GearIcon,
} from "@components/form-builder/icons";

export const LeftNavigation = () => {
  const { t } = useTranslation(["admin-login", "common"]);
  const { ability } = useAccessControl();
  const router = useRouter();
  const path = String(router.pathname);

  const iconClassname =
    "inline-block w-6 h-6 group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="absolute">
      {ability?.can("view", "User") && (
        <LeftNavLink id="users" href={`/admin/users`} isActive={path === "/admin/users"}>
          <>
            <NameIcon className={iconClassname} />
            {t("adminNav.users", { ns: "common" })}
          </>
        </LeftNavLink>
      )}

      {ability?.can("update", "Privilege") && (
        <LeftNavLink
          id="privileges"
          href="/admin/view-templates"
          isActive={path === "/admin/view-templates"}
        >
          <>
            <PageIcon className={iconClassname} />
            {t("adminNav.templates", { ns: "common" })}
          </>
        </LeftNavLink>
      )}

      {ability?.can("view", "Flag") && (
        <LeftNavLink id="flags" href="/admin/flags" isActive={path === "/admin/flags"}>
          <>
            <FlagIcon className={iconClassname} />
            {t("adminNav.features", { ns: "common" })}
          </>
        </LeftNavLink>
      )}
      {ability?.can("view", "Flag") && (
        <LeftNavLink id="settings" href="/admin/settings" isActive={path === "/admin/settings"}>
          <>
            <GearIcon className={iconClassname} />
            {t("adminNav.settings", { ns: "common" })}
          </>
        </LeftNavLink>
      )}
      {ability?.can("view", "Privilege") && (
        <LeftNavLink
          id="privileges"
          href="/admin/privileges"
          isActive={path === "/admin/privileges"}
        >
          <>
            <TreeViewIcon className={iconClassname} />
            {t("adminNav.privileges", { ns: "common" })}
          </>
        </LeftNavLink>
      )}
    </nav>
  );
};
