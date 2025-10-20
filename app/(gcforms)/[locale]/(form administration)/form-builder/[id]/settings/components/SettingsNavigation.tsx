"use client";

import { useTranslation } from "@i18n/client";
import { SubNavLink } from "@clientComponents/globals/SubNavLink";
import { GearIcon, ChatIcon } from "@serverComponents/icons";

export const SettingsNavigation = ({ id }: { id: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder");

  return (
    <div className="relative flex">
      <div className="flex">
        <nav className="mb-6 flex flex-wrap" aria-label={t("navLabelEditor")}>
          <SubNavLink href={`/${language}/form-builder/${id}/settings`}>
            <span className="text-sm laptop:text-base">
              <ChatIcon className="mr-2 inline-block laptop:mt-[-2px]" />
              {t("settingsNavHome")}
            </span>
          </SubNavLink>
          <SubNavLink href={`/${language}/form-builder/${id}/settings/manage`}>
            <span className="text-sm laptop:text-base">
              <GearIcon className="mr-2 inline-block laptop:mt-[-2px]" />
              {t("settings.formManagement")}
            </span>
          </SubNavLink>

          <SubNavLink href={`/${language}/form-builder/${id}/settings/api-integration`}>
            <span className="text-sm laptop:text-base">
              <GearIcon className="mr-2 inline-block laptop:mt-[-2px]" />
              {t("settings.apiIntegration.navigation.title")}
            </span>
          </SubNavLink>
        </nav>
      </div>
    </div>
  );
};
