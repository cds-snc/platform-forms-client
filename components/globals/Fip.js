import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "../../i18n";
import LanguageToggle from "./LanguageToggle";

const Fip = ({ t, i18n }) => (
  <div className="page--container">
    <div className="fip-container">
      <div className="canada-flag">
        <a href={t("fip.link")} aria-label={t("fip.text")}>
          <img
            src={"/img/sig-blk-" + i18n.language + ".svg"}
            alt={t("fip.text")}
          />
        </a>
      </div>
      <LanguageToggle />
    </div>
  </div>
);

Fip.propTypes = {
  t: PropTypes.func.isRequired,
  i18n: PropTypes.object.isRequired,
};

export default withTranslation("common")(Fip);
