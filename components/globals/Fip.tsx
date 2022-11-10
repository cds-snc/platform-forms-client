import React from "react";
import PropTypes from "prop-types";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import LanguageToggle from "./LanguageToggle";
import { getProperty } from "@lib/formBuilder";
import { isSplashPage, isPublicPage } from "@lib/routeUtils";
import Menu from "@components/auth/LoginMenu";
import { PublicFormRecord } from "@lib/types";

const Fip = ({ formRecord }: { formRecord?: PublicFormRecord }) => {
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
            <img src={logo} alt={logoTitle} />
          </picture>
        </a>
      </div>
      <div className="inline-flex">
        {!isPublicPage() && <Menu isAuthenticated={status === "authenticated"} />}
        {!isSplashPage() && <LanguageToggle />}
      </div>
    </div>
  );
};

export default Fip;
