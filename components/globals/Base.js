import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Footer from "./Footer";
import Head from "next/head";
import PhaseBanner from "./PhaseBanner";
import SkipLink from "./SkipLink";
import Fip from "./Fip";
import AdminNav from "./AdminNav";
import { useTranslation } from "next-i18next";
import { getPageClassNames } from "@lib/routeUtils";

const Base = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const formRecord =
    children && children.props && children.props.formRecord ? children.props.formRecord : null;
  const classes = getPageClassNames(formRecord);

  const isAdmin = children && children.props && children.props.user;
  const isEmbeddable = formRecord && children && children.props && children.props.isEmbeddable;

  const shouldDisplayAlphaBanner = formRecord ? formRecord.formConfig.displayAlphaBanner : true;
  const { t } = useTranslation("common");

  return (
    mounted && (
      <>
        <Head>
          <title>{t("title")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <meta charSet="utf-8" />
          <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
        </Head>

        <SkipLink />
        <div className={classes}>
          {!isEmbeddable && (
            <header>
              {shouldDisplayAlphaBanner && <PhaseBanner />}
              <Fip formRecord={formRecord} />
              {isAdmin && <AdminNav user={children.props.user} />}
            </header>
          )}
          <main id="content">{children}</main>
          {!isEmbeddable && <Footer />}
        </div>
      </>
    )
  );
};

Base.propTypes = {
  children: PropTypes.object.isRequired,
};

export default Base;
