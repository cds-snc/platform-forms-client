import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import Footer from "./Footer";
import PhaseBanner from "./PhaseBanner";
import SkipLink from "./SkipLink";
import Fip from "./Fip";
import AdminNav from "./AdminNav";
import { useTranslation } from "next-i18next";
import { getPageClassNames } from "../../lib/routeUtils";
import { useFlagHook } from "../../lib/flags_hook";

const Base = ({ children }) => {
  const { t } = useTranslation("common");

  const googleTag = useFlagHook("googleAnalytics");
  const formConfig =
    children && children.props && children.props.formConfig ? children.props.formConfig : null;
  const classes = getPageClassNames(formConfig);

  const isAdmin = children && children.props && children.props.user;
  const isEmbeddable = formConfig && children && children.props && children.props.isEmbeddable;

  return (
    <>
      <Head>
        {googleTag && (
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
