import React from "react";
import { useTranslation } from "next-i18next";
import { SubNavLink } from "./SubNavLink";
import { useActivePathname } from "@components/form-builder/hooks";
import { LangSwitcher } from "../shared/LangSwitcher";
import { EmailIcon, BrandIcon, GearIcon } from "@components/form-builder/icons";

export const SettingsNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { activePathname } = useActivePathname();

  return (
    <div className="relative flex">
      <div className="flex justify-content:space-between">
        <nav className="mb-8 flex " aria-label={t("navLabelEditor")}>
          <SubNavLink href="/form-builder/settings">
            <span className="text-sm laptop:text-base">
              <EmailIcon className="hidden laptop:inline-block laptop:mt-[-2px] laptop:mr-2" />
              {t("settingsNavHome")}
            </span>
          </SubNavLink>
          <SubNavLink href="/form-builder/settings/branding">
            <span className="text-sm laptop:text-base">
              <BrandIcon className="hidden laptop:inline-block laptop:mt-[-2px] laptop:mr-2 fill-black" />
              {t("branding.heading")}
            </span>
          </SubNavLink>
          <SubNavLink href="/form-builder/settings/form">
            <span className="text-sm laptop:text-base">
              <GearIcon className="hidden laptop:inline-block laptop:mt-[-2px] laptop:mr-2" />
              {t("settings.formManagement")}
            </span>
          </SubNavLink>
        </nav>
      </div>
      <div>
        {activePathname.endsWith("/edit") && (
          <div className="absolute right-0 mr-24 top-0">
            <LangSwitcher descriptionLangKey="editingIn" />
          </div>
        )}
      </div>
    </div>
  );
};
