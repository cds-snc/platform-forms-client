import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import getConfig from "next/config";
import Footer from "./Footer";
import PhaseBanner from "./PhaseBanner";
import SkipLink from "./SkipLink";
import Fip from "./Fip";
import { useTranslation } from "next-i18next";
import { getPageClassNames } from "../../lib/routeUtils";

const Base = ({ children }) => {
  const { t } = useTranslation("common");

  const {
    publicRuntimeConfig: { isProduction: isProduction },
  } = getConfig();
  const formMetadata =
    children && children.props && children.props.formMetadata ? children.props.formMetadata : null;
  const isEmbeddable = formMetadata && children && children.props && children.props.isEmbeddable;
  const classes = getPageClassNames(formMetadata);

  return (
    <>
      <Head>
        {isProduction && (
          <React.Fragment>
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-8PNSS76E3B"></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                
                  gtag('config', 'G-8PNSS76E3B');
              `,
              }}
            />
          </React.Fragment>
        )}
        <script type="text/javascript" src="/static/scripts/form-polyfills.js"></script>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
        <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css?family=Lato:400,700%7CNoto+Sans:400,700&amp;display=fallback"
          rel="stylesheet"
        />
        <title>{t("title")}</title>
      </Head>
      <SkipLink />
      <div className={classes}>
        {!isEmbeddable && (
          <header>
            <PhaseBanner />
            <Fip formMetadata={formMetadata} />
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
