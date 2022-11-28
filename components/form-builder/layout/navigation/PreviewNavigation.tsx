import React from "react";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { SubNavLink } from "./SubNavLink";

export const PreviewNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { status } = useSession();

  return (
    <nav className="mb-8 flex divide-x-2 divide-gray-600" aria-label={t("navLabelPreview")}>
      <SubNavLink href="/form-builder/preview">{t("preview")}</SubNavLink>
      {status === "authenticated" && (
        <>
          <SubNavLink href="/form-builder/preview/test-data-delivery">
            {t("testDataDelivery")}
          </SubNavLink>
        </>
      )}
      <SubNavLink href="/form-builder/preview/settings">{t("settings")}</SubNavLink>
    </nav>
  );
};
