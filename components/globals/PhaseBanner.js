import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "../../i18n";

const PhaseBanner = ({ t }) => (
  <div data-testid="PhaseBanner" className="gc-phase-banner">
    <div>
      <span>ALPHA</span>
      <span>{t("phase.desc")}</span>
    </div>
  </div>
);

PhaseBanner.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("common")(PhaseBanner);
