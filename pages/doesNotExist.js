import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "../i18n";

const FormDoesNotExist = ({ t }) => (
  <>
    <h1>{t("title")}</h1>

    <div>
      <p>{t("body")}</p>
    </div>
  </>
);

FormDoesNotExist.getInitialProps = async () => ({
  namespacesRequired: ["error"],
});

FormDoesNotExist.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("error")(FormDoesNotExist);
