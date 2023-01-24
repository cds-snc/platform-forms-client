import React from "react";
import PropTypes from "prop-types";
import Footer from "../Footer";
import Head from "next/head";
import SkipLink from "../SkipLink";
import Fip from "../Fip";

interface BaseProps extends React.PropsWithChildren {
  showLanguageToggle?: boolean;
  showLogin?: boolean;
}

const Base = ({ children, showLanguageToggle, showLogin }: BaseProps) => {
  return (
    <div className="flex flex-col h-full">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </Head>

      <SkipLink />

      <header>
        <Fip {...{ showLanguageToggle, showLogin }} />
      </header>

      <div id="page-container">
        <main id="content">{children}</main>
      </div>

      <Footer />
    </div>
  );
};

Base.propTypes = {
  children: PropTypes.object.isRequired,
};

export default Base;
