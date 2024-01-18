"use client";
import React from "react";
import { NavLink } from "@clientComponents/globals/NavLink";
import { useTranslation } from "@i18n/client";
import { usePathname } from "next/navigation";
import { useAccessControl } from "@lib/hooks";

import { NameIcon, FlagIcon, GearIcon } from "@clientComponents/icons";

export const LeftNavigation = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["admin-login", "common"]);
  const { ability } = useAccessControl();

  const path = usePathname()?.replace(`/${language}`, "");

  const iconClassname =
    "block box-border mt-1 w-8 h-8 group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default";

  return (
    <nav>
      <ul className="m-0 list-none p-0">
        {ability?.can("view", "User") && (
          <li>
            <NavLink
              id="users"
              href={`/${language}/admin/accounts`}
              isActive={path === "/admin/accounts"}
            >
              <div className="flex gap-2">
                <NameIcon className={iconClassname} />
                <div>{t("adminNav.users", { ns: "common" })}</div>
              </div>
            </NavLink>
          </li>
        )}
        {ability?.can("view", "Flag") && (
          <li>
            <NavLink
              id="flags"
              href={`/${language}/admin/flags`}
              isActive={path === "/admin/flags"}
            >
              <div className="flex items-start gap-2">
                <FlagIcon className={`${iconClassname}`} />
                <div>{t("adminNav.features", { ns: "common" })}</div>
              </div>
            </NavLink>
          </li>
        )}
        {ability?.can("view", "Flag") && (
          <li>
            <NavLink
              id="settings"
              href={`/${language}/admin/settings`}
              isActive={path === "/admin/settings"}
            >
              <div className="flex items-start gap-2">
                <GearIcon className={iconClassname} />
                <div>{t("adminNav.settings", { ns: "common" })}</div>
              </div>
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};
