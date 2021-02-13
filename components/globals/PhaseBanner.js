import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "../../i18n";

const PhaseBanner = ({ t }) => (
  <div data-testid="PhaseBanner" className="gc-phase-banner sm:px-8">
    <div className="banner-container">
      <div>
        <span className="phase-badge">ALPHA</span>
      </div>
      <div>
        <span className="phase-text pb-2">{t("phase.desc")}</span>
      </div>
    </div>
  </div>
);

PhaseBanner.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("common")(PhaseBanner);
