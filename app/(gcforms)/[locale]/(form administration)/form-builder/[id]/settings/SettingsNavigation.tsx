"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { SubNavLink } from "../../components/navigation/SubNavLink";
import { EmailIcon, BrandIcon, GearIcon } from "@serverComponents/icons";

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
              <EmailIcon className="mr-2 inline-block laptop:mt-[-2px]" />
              {t("settingsNavHome")}
            </span>
          </SubNavLink>
          <SubNavLink href={`/${language}/form-builder/${id}/settings/branding`}>
            <span className="text-sm laptop:text-base">
              <BrandIcon className="mr-2 inline-block fill-black laptop:mt-[-2px]" />
              {t("branding.heading")}
            </span>
          </SubNavLink>
          <SubNavLink href={`/${language}/form-builder/${id}/settings/manage`}>
            <span className="text-sm laptop:text-base">
              <GearIcon className="mr-2 inline-block laptop:mt-[-2px]" />
              {t("settings.formManagement")}
            </span>
          </SubNavLink>
        </nav>
      </div>
    </div>
  );
};
