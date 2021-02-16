import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "../i18n";
import Link from "next/link";

function Error({ statusCode, t }) {
  return (
    <>
      <h1 className="gc-h1">
        {t("500.title")} {statusCode}
      </h1>
      <p>{t("500.body")}</p>
      <Link href={t("home-link.link")}>{t("home-link.desc")}</Link>
    </>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

Error.propTypes = {
  t: PropTypes.func.isRequired,
  statusCode: PropTypes.number,
};

export default withTranslation("error")(Error);
