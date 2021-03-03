import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "next-i18next";

const PhaseBanner = ({ t }) => (
  <div data-testid="PhaseBanner" className="gc-phase-banner">
    <div className="banner-container">
      <div>
        <span className="phase-badge">ALPHA</span>
      </div>
      <div>
        <span className="phase-text">{t("phase.desc")}</span>
      </div>
    </div>
  </div>
);

PhaseBanner.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("common")(PhaseBanner);
