"use client";

import { useTranslation } from "@i18n/client";

import { TabNavLink } from "@clientComponents/globals/TabNavLink";
import { usePathname } from "next/navigation";

export const SettingsNavigation = ({ id }: { id: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder");

  const pathname = usePathname();

  return (
    <nav className="relative mb-10 flex border-b border-black" aria-label={t("responses.navLabel")}>
      <TabNavLink
        active={
          pathname.includes("manage") === false && pathname.includes("api-integration") === false
        }
        href={`/${language}/form-builder/${id}/settings`}
      >
        <span className="text-sm laptop:text-base">{t("settingsNavHome")}</span>
      </TabNavLink>

      <TabNavLink
        active={pathname.includes("manage")}
        href={`/${language}/form-builder/${id}/settings/manage`}
      >
        <span className="text-sm laptop:text-base">{t("settings.formManagement")}</span>
      </TabNavLink>

      <TabNavLink
        active={pathname.includes("api-integration")}
        href={`/${language}/form-builder/${id}/settings/api-integration`}
      >
        <span className="text-sm laptop:text-base">
          {t("settings.apiIntegration.navigation.title")}
        </span>
      </TabNavLink>
    </nav>
  );
};
