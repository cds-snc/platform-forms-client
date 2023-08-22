import React from "react";
import { LeftNavLink } from "@components/globals/LeftNavLink";
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
    <nav>
      <ul className="m-0 list-none p-0">
        {ability?.can("view", "User") && (
          <li>
            <LeftNavLink id="users" href={`/admin/accounts`} isActive={path === "/admin/accounts"}>
              <NameIcon className={iconClassname} />
              {t("adminNav.users", { ns: "common" })}
            </LeftNavLink>
          </li>
        )}

        {ability?.can("view", "Flag") && (
          <li>
            <LeftNavLink id="flags" href="/admin/flags" isActive={path === "/admin/flags"}>
              <FlagIcon className={iconClassname} />
              {t("adminNav.features", { ns: "common" })}
            </LeftNavLink>
          </li>
        )}

        {ability?.can("view", "Flag") && (
          <li>
            <LeftNavLink id="settings" href="/admin/settings" isActive={path === "/admin/settings"}>
              <GearIcon className={iconClassname} />
              {t("adminNav.settings", { ns: "common" })}
            </LeftNavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};
