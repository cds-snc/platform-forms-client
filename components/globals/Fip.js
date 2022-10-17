import React from "react";
import PropTypes from "prop-types";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import LanguageToggle from "./LanguageToggle";
import { getProperty } from "@lib/formBuilder";
import { isSplashPage, isPublicPage } from "@lib/routeUtils";
import Menu from "@components/auth/LoginMenu";

const Fip = (props) => {
  const { t, i18n } = useTranslation("common");

  // Check if custom branding was provided, otherwise show the Government of Canada branding
  const formTheme = props.formRecord?.form ? props.formRecord.form.brand : null;

  const logo =
    formTheme && formTheme[getProperty("logo", i18n.language)]
      ? formTheme[getProperty("logo", i18n.language)]
      : "/img/sig-blk-" + i18n.language + ".svg";

  const linkUrl =
    formTheme && formTheme[getProperty("url", i18n.language)]
      ? formTheme[getProperty("url", i18n.language)]
      : t("fip.link");

  const logoTitle =
    formTheme && formTheme[getProperty("logoTitle", i18n.language)]
      ? formTheme[getProperty("logoTitle", i18n.language)]
      : t("fip.text");

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

Fip.propTypes = {
  formRecord: PropTypes.object,
};

export default Fip;
