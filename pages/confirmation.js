import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "../i18n";
import { useRouter } from "next/router";

const Confirmation = ({ t }) => {
  const router = useRouter();
  const urlQuery = router.query;
  const backToLink =
    urlQuery && urlQuery.referrerUrl ? (
      <a href={urlQuery.referrerUrl}>{t("backLink")}</a>
    ) : null;

  return (
    <>
      <h1>{t("title")}</h1>

      <div>
        <p>{t("body")}</p>
      </div>

      <div className="gc-form-confirmation">{backToLink}</div>
    </>
  );
};

Confirmation.getInitialProps = async () => ({
  namespacesRequired: ["confirmation"],
});

Confirmation.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("confirmation")(Confirmation);
