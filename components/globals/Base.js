import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import Footer from "./Footer";
import PhaseBanner from "./PhaseBanner";
import SkipLink from "./SkipLink";
import Fip from "./Fip";

const Base = ({ children }) => {
  const isProduction = process.env.NODE_ENV === "production";
  return (
    <>
      <Head>
        {isProduction && (
          <React.Fragment>
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-KY2EVJV33K"
            ></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-KY2EVJV33K');
              `,
              }}
            />
          </React.Fragment>
        )}
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link
          rel="shortcut icon"
          href="/favicon.ico"
          type="image/x-icon"
          sizes="32x32"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com/"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css?family=Lato:400,700%7CNoto+Sans:400,700&amp;display=fallback"
          rel="stylesheet"
        />
      </Head>
      <SkipLink />
      <div className="outer-container">
        <header>
          <PhaseBanner />
          <Fip />
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
