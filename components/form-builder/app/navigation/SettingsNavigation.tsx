import React from "react";
import { useTranslation } from "next-i18next";
import { SubNavLink } from "./SubNavLink";
import { useActivePathname } from "@components/form-builder/hooks";
import { LangSwitcher } from "../shared/LangSwitcher";
import { EmailIcon, BrandIcon } from "@components/form-builder/icons";

export const SettingsNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { activePathname } = useActivePathname();

  const svgFill =
    "[&_svg]:focus:fill-white [&_svg]:hover:fill-white hover:bg-gray-600 hover:!text-white-default";

  return (
    <div className="relative flex">
      <div className="flex justify-content:space-between">
        <nav className="mb-8 flex " aria-label={t("navLabelEditor")}>
          <SubNavLink
            href="/form-builder/settings"
            className={`!text-black focus:!text-white ${svgFill} `}
            activeClassName="[&_svg]:fill-white"
          >
            <span>
              <EmailIcon className="inline-block mt-[-2px] mr-3" />
              {t("settingsNavHome")}
            </span>
          </SubNavLink>
          <SubNavLink
            href="/form-builder/settings/branding"
            className={`!text-black focus:!text-white ${svgFill} [&_svg]:fill-black`}
            activeClassName={`[&_svg]:fill-white ${svgFill} focus:text-white`}
          >
            <span>
              <BrandIcon className="inline-block mt-[-2px] mr-2" />
              {t("branding.heading")}
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
