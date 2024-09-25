"use client";
import { useTranslation } from "@i18n/client";
import { SubNavLink } from "@clientComponents/globals/SubNavLink";
import { EmailIcon, BrandIcon, GearIcon, ProtectedIcon } from "@serverComponents/icons";
import { useIsAdminUser } from "@lib/hooks/form-builder";

export const SettingsNavigation = ({ id }: { id: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder");

  const isAdmin = useIsAdminUser();

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
          {isAdmin && (
            <SubNavLink href={`/${language}/form-builder/${id}/settings/api`}>
              <span className="text-sm laptop:text-base">
                <ProtectedIcon className="mr-2 inline-block laptop:mt-[-2px]" />
                {t("settings.api.title")}
              </span>
            </SubNavLink>
          )}
        </nav>
      </div>
    </div>
  );
};
