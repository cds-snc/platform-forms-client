import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "@i18n/client";
import { ErrorPanel } from "@clientComponents/globals";

function Error({ statusCode }) {
  const { t } = useTranslation("error");
  if (statusCode === 500) {
    <ErrorPanel headingTag="h1" title={t("500.title")} className={`error-${statusCode}`}>
      <p>{t("500.body")}</p>
    </ErrorPanel>;
  }

  return <ErrorPanel className={`error-${statusCode}`} />;
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

Error.propTypes = {
  statusCode: PropTypes.number,
};

export default Error;
