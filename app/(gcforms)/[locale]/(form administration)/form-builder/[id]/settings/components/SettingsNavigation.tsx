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

  const isSettingsActive =
    pathname.includes("manage") === false && pathname.includes("api-integration") === false;
  const isManageActive = pathname.includes("manage");
  const isApiIntegrationActive = pathname.includes("api-integration");

  return (
    <nav className="relative mb-10 flex border-b border-black" aria-label={t("responses.navLabel")}>
      <TabNavLink
        active={isSettingsActive}
        href={`/${language}/form-builder/${id}/settings`}
        setAriaCurrent={isSettingsActive}
        id="settings"
      >
        <span className="text-sm laptop:text-base">{t("settingsNavHome")}</span>
      </TabNavLink>

      <TabNavLink
        active={isManageActive}
        href={`/${language}/form-builder/${id}/settings/manage`}
        setAriaCurrent={isManageActive}
        id="manage-form"
      >
        <span className="text-sm laptop:text-base">{t("settings.formManagement")}</span>
      </TabNavLink>

      <TabNavLink
        active={isApiIntegrationActive}
        href={`/${language}/form-builder/${id}/settings/api-integration`}
        setAriaCurrent={isApiIntegrationActive}
        id="api-integration"
      >
        <span className="text-sm laptop:text-base">
          {t("settings.apiIntegration.navigation.title")}
        </span>
      </TabNavLink>
    </nav>
  );
};
