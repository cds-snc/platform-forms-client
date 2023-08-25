import React from "react";
import { useTranslation } from "next-i18next";
import { SubNavLink } from "./SubNavLink";
import { EmailIcon, BrandIcon, GearIcon } from "@appComponents/form-builder/icons";
import { useTemplateStore } from "@appComponents/form-builder/store";

export const SettingsNavigation = () => {
  const { t } = useTranslation("form-builder");

  const { id } = useTemplateStore((s) => ({
    id: s.id,
  }));

  const manageFormLink = id ? `/form-builder/settings/${id}/form` : "/form-builder/settings/form";

  return (
    <div className="relative flex">
      <div className="flex">
        <nav className="mb-8 flex flex-wrap" aria-label={t("navLabelEditor")}>
          <SubNavLink href="/form-builder/settings">
            <span className="text-sm laptop:text-base">
              <EmailIcon className="mr-2 inline-block laptop:mt-[-2px]" />
              {t("settingsNavHome")}
            </span>
          </SubNavLink>
          <SubNavLink href="/form-builder/settings/branding">
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
