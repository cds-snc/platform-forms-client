import PropTypes from "prop-types";
import { withTranslation } from "../../i18n";

const SkipLink = ({ t }) => (
  <nav>
    <div id="skip-link-container">
      <a href="#content" id="skip-link">
        {t("skip-link")}
      </a>
    </div>
  </nav>
);

SkipLink.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("common")(SkipLink);
