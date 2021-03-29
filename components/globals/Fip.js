import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import LanguageToggle from "./LanguageToggle";
import { getProperty } from "../../lib/formBuilder";

const Fip = (props) => {
  const { t, i18n } = useTranslation("common");

  // Check if custom branding was provided, otherwise show the Government of Canada branding
  const formTheme = props.formMetadata ? props.formMetadata.brand : null;

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

  return (
    <div data-testid="fip" className="gc-fip">
      <div className="canada-flag">
        <a href={linkUrl} aria-label={logoTitle}>
          <img src={logo} alt={logoTitle} />
        </a>
      </div>
      <LanguageToggle />
    </div>
  );
};

Fip.propTypes = {
  formMetadata: PropTypes.object,
};

export default Fip;
