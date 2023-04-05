import React from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import LanguageToggle from "./LanguageToggle";
import { getProperty } from "@lib/formBuilder";
import Menu from "@components/auth/LoginMenu";
import { PublicFormRecord } from "@lib/types";

const Fip = ({
  formRecord,
  showLogin = false,
  showLanguageToggle = true,
}: {
  formRecord?: PublicFormRecord;
  showLogin?: boolean;
  showLanguageToggle?: boolean;
}) => {
  const { t, i18n } = useTranslation("common");

  // Check if custom branding was provided, otherwise show the Government of Canada branding
  const formTheme = formRecord?.form ? formRecord.form.brand : null;

  const logo =
    (formTheme?.[getProperty("logo", i18n.language)] as string | undefined) ??
    "/img/sig-blk-" + i18n.language + ".svg";

  const linkUrl =
    (formTheme?.[getProperty("url", i18n.language)] as string | undefined) ?? t("fip.link");

  const logoTitle =
    (formTheme?.[getProperty("logoTitle", i18n.language)] as string | undefined) ?? t("fip.text");

  const { status } = useSession();

  return (
    <div data-testid="fip" className="gc-fip">
      <div className="canada-flag">
        <a href={linkUrl} aria-label={t("fip.label")}>
          <picture>
            <img src={logo} alt={logoTitle} className="max-w-[600px] max-h-[60px]" />
          </picture>
        </a>
      </div>
      <div className="inline-flex gap-4">
        {showLogin && <Menu isAuthenticated={status === "authenticated"} />}
        {showLanguageToggle && <LanguageToggle />}
      </div>
    </div>
  );
};

export default Fip;
