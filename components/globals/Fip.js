import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import LanguageToggle from "./LanguageToggle";
import { getProperty } from "../../lib/formBuilder";

const Fip = (props) => {
  const { t, i18n } = useTranslation("common");
  const formTheme = props.formMetadata ? props.formMetadata.brand : null;

  const customLogo =
    formTheme && formTheme[getProperty("logo", i18n.language)]
      ? formTheme[getProperty("logo", i18n.language)]
      : null;

  const logo = customLogo ? customLogo : "/img/sig-blk-" + i18n.language + ".svg";
  const linkUrl =
    formTheme && formTheme[getProperty("url", i18n.language)]
      ? formTheme[getProperty("url", i18n.language)]
      : t("fip.link");

  return (
    <div data-testid="fip" className="gc-fip">
      <div className="canada-flag">
        <a href={linkUrl} aria-label={t("fip.text")}>
          <img src={logo} alt={t("fip.text")} />
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
