import React from "react";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { SubNavLink } from "./SubNavLink";

export const PreviewNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { status } = useSession();

  return (
    <div className="relative">
      <nav className="mb-8 flex divide-x-2 divide-gray-600" aria-label={t("navLabelPreview")}>
        <SubNavLink href="/form-builder/preview">{t("preview")}</SubNavLink>
        {status === "authenticated" && (
          <>
            <SubNavLink href="/form-builder/preview/test-data-delivery">{t("test")}</SubNavLink>
          </>
        )}
        <SubNavLink href="/form-builder/preview/settings">{t("settings")}</SubNavLink>
      </nav>
      <div className="absolute right-0 top-0 mt-1">
        <label htmlFor="lang" className="font-bold">
          Preview language:{" "}
        </label>
        <select id="lang" className="">
          <option>English</option>
          <option>French</option>
        </select>
      </div>
    </div>
  );
};
