import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import getConfig from "next/config";
import Footer from "./Footer";
import PhaseBanner from "./PhaseBanner";
import SkipLink from "./SkipLink";
import Fip from "./Fip";
import classnames from "classnames";
import { useRouter } from "next/router";

const getPageClassNames = (formMetadata) => {
  const router = useRouter();
  const pageName = router && router.asPath ? router.asPath.split("?")[0] : "";
  const brandName = formMetadata && formMetadata.brand ? formMetadata.brand.title : "";
  const classes = classnames("outer-container", `page${pageName.replace(/\//g, "-")}`, brandName);
  return classes;
};

const Base = ({ children }) => {
  const {
    publicRuntimeConfig: { isProduction: isProduction },
  } = getConfig();
  const formMetadata =
    children && children.props && children.props.formMetadata ? children.props.formMetadata : null;
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
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
        <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css?family=Lato:400,700%7CNoto+Sans:400,700&amp;display=fallback"
          rel="stylesheet"
        />
      </Head>
      <SkipLink />
      <div className={classes}>
        <header>
          <PhaseBanner />
          <Fip formMetadata={formMetadata} />
        </header>
        <main id="content">{children}</main>
        <Footer />
      </div>
    </>
  );
};

Base.propTypes = {
  children: PropTypes.object.isRequired,
};

export default Base;
