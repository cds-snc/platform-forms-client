import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import LanguageToggle from "./LanguageToggle";
import { getProperty } from "@lib/formBuilder";
import { isSplashPage } from "@lib/routeUtils";

const Fip = (props) => {
  const { t, i18n } = useTranslation("common");

  // Check if custom branding was provided, otherwise show the Government of Canada branding
  const formTheme = props.formRecord?.formConfig?.form
    ? props.formRecord.formConfig.form.brand
    : null;

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

  // Do not show the language toggle on the "splash" page
  const languageToggle = isSplashPage() ? null : <LanguageToggle />;

  return (
    <div data-testid="fip" className="gc-fip">
      <div className="canada-flag">
        <a href={linkUrl} aria-label={t("fip.label")}>
          <img src={logo} alt={logoTitle} />
        </a>
      </div>
      {languageToggle}
    </div>
  );
};

Fip.propTypes = {
  formRecord: PropTypes.object,
};

export default Fip;
