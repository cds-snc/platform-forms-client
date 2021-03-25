import React from "react";
import { useTranslation } from "next-i18next";
import LanguageToggle from "./LanguageToggle";
import { getProperty } from "../../lib/formBuilder";

const Fip = (props) => {
  const { t, i18n } = useTranslation("common");
  const formTheme = props.formMetadata ? props.formMetadata.theme : null;

  const customLogo =
    formTheme && formTheme[getProperty("logo", i18n.language)]
      ? formTheme[getProperty("logo", i18n.language)]
      : null;

  const logo = customLogo ? customLogo : "/img/sig-blk-" + i18n.language + ".svg";

  return (
    <div data-testid="fip" className="gc-fip">
      <div className="canada-flag">
        <a href={t("fip.link")} aria-label={t("fip.text")}>
          <img src={logo} alt={t("fip.text")} />
        </a>
      </div>
      <LanguageToggle />
    </div>
  );
};

export default Fip;
