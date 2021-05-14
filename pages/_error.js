import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import Link from "next/link";

function Error({ statusCode }) {
  const { t } = useTranslation("error");
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
  statusCode: PropTypes.number,
};

export default Error;
