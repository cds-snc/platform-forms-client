import React from "react";
import PropTypes from "prop-types";
import Footer from "./Footer";
import Head from "next/head";
import PhaseBanner from "./PhaseBanner";
import SkipLink from "./SkipLink";
import Fip from "./Fip";
import AdminNav from "./AdminNav";
import { useTranslation } from "next-i18next";
import { getPageClassNames } from "../../lib/routeUtils";

const Base = ({ children }) => {
  const formConfig =
    children && children.props && children.props.formConfig ? children.props.formConfig : null;
  const classes = getPageClassNames(formConfig);

  const isAdmin = children && children.props && children.props.user;
  const isEmbeddable = formConfig && children && children.props && children.props.isEmbeddable;

  const shouldDisplayAlphaBanner = formConfig ? formConfig.displayAlphaBanner : true;
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-W3ZVVX5"
          title="Google Tag Manager Iframe Window"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        ></iframe>
      </noscript>

      <SkipLink />
      <div className={classes}>
        {!isEmbeddable && (
          <header>
            {shouldDisplayAlphaBanner && <PhaseBanner />}
            <Fip formConfig={formConfig} />
            {isAdmin && <AdminNav user={children.props.user} />}
          </header>
        )}
        <main id="content">{children}</main>
        {!isEmbeddable && <Footer />}
      </div>
    </>
  );
};

Base.propTypes = {
  children: PropTypes.object.isRequired,
};

export default Base;
