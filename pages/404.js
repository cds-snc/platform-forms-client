import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "../i18n";
import Link from "next/link";

const PageNotFound = ({ t }) => (
  <>
    <h1 className="gc-h1">{t("404.title")}</h1>

    <div>
      <p>{t("404.body")}</p>
      <Link href={t("home-link.link")}>{t("home-link.desc")}</Link>
    </div>
  </>
);

PageNotFound.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("error")(PageNotFound);
