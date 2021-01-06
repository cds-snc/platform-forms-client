import PropTypes from "prop-types";
import { withTranslation } from "../../i18n";

const PhaseBanner = ({ t }) => (
  <div className="phase-banner">
    <div>
      <span>
        <strong className="font-normal">ALPHA</strong>
        <span className="visually-hidden"></span>
      </span>
      <span>{t("phase.desc")}</span>
    </div>
  </div>
);

PhaseBanner.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("common")(PhaseBanner);
