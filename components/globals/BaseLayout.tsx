import React from "react";
import PropTypes from "prop-types";
import Footer from "./Footer";
import Head from "next/head";
import PhaseBanner from "./PhaseBanner";
import SkipLink from "./SkipLink";
import Fip from "./Fip";

const Base = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </Head>

      <SkipLink />

      <header>
        <PhaseBanner />
        <Fip />
      </header>

      <main id="content">{children}</main>

      <Footer />
    </>
  );
};

Base.propTypes = {
  children: PropTypes.object.isRequired,
};

export default Base;
