import PropTypes from "prop-types";
import { Link, withTranslation } from "../i18n";

const Confirmation = ({ t }) => (
  <>
    <h1>{t("title")}</h1>

    <div>
      <p>{t("body")}</p>
    </div>
  </>
);

Confirmation.getInitialProps = async () => ({
  namespacesRequired: ["confirmation"],
});

Confirmation.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("confirmation")(Confirmation);
