import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { withTranslation } from "../../i18n";

const LanguageToggle = ({ t, i18n }) => {
  const locale = i18n.language;

  useEffect(() => {
    const html = document.querySelector("html");

    if (html) html.setAttribute("lang", locale);
  }, [locale]);

  return (
    <>
      <h2 className="sr-only">{t("lang-toggle")}</h2>
      <div className="gc-language-toggle">
        {locale == "en" ? (
          <button
            onClick={() => {
              i18n.changeLanguage("fr");
            }}
            lang="fr"
          >
            Français
          </button>
        ) : (
          <button
            onClick={() => {
              i18n.changeLanguage("en");
            }}
            lang="en"
          >
            English
          </button>
        )}
      </div>
    </>
  );
};
LanguageToggle.propTypes = {
  t: PropTypes.func.isRequired,
  i18n: PropTypes.object.isRequired,
};

export default withTranslation("common")(LanguageToggle);
