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
import { useFlag } from "../../lib/hooks/flags";

const Base = ({ children }) => {
  const { t } = useTranslation("common");

  const googleTag = useFlag("googleAnalytics");
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
            <script
              dangerouslySetInnerHTML={{
                __html: `
                <!-- Google Tag Manager -->
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-W3ZVVX5');
                <!-- End Google Tag Manager -->
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
