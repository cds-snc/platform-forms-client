"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { SubNavLink } from "./SubNavLink";
import { EmailIcon, BrandIcon, GearIcon } from "@clientComponents/icons";
import { useTemplateStore } from "@clientComponents/form-builder/store";

export const SettingsNavigation = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder");

  const { id } = useTemplateStore((s) => ({
    id: s.id,
  }));

  const manageFormLink = id
    ? `/${language}/form-builder/settings/${id}/form`
    : `/${language}/form-builder/settings/form`;

  return (
    <div className="relative flex">
      <div className="flex">
        <nav className="mb-6 flex flex-wrap" aria-label={t("navLabelEditor")}>
          <SubNavLink href={`/${language}/form-builder/settings`}>
            <span className="text-sm laptop:text-base">
              <EmailIcon className="mr-2 inline-block laptop:mt-[-2px]" />
              {t("settingsNavHome")}
            </span>
          </SubNavLink>
          <SubNavLink href={`/${language}/form-builder/settings/branding`}>
            <span className="text-sm laptop:text-base">
              <BrandIcon className="mr-2 inline-block fill-black laptop:mt-[-2px]" />
              {t("branding.heading")}
            </span>
          </SubNavLink>
          <SubNavLink href={manageFormLink}>
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
