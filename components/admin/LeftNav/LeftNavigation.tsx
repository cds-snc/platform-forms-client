import React from "react";
import { LeftNavLink } from "./LeftNavLink";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useAccessControl } from "@lib/hooks";

import { NameIcon, FlagIcon, GearIcon } from "@components/form-builder/icons";

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
        <LeftNavLink id="users" href={`/admin/accounts`} isActive={path === "/admin/accounts"}>
          <>
            <NameIcon className={iconClassname} />
            {t("adminNav.users", { ns: "common" })}
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
    </nav>
  );
};
