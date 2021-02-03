import React from "react";
import PropTypes from "prop-types";
import App from "next/app";
import { appWithTranslation } from "../i18n";
import Base from "../components/globals/Base";
import "../styles/app.scss";
import { logMessage } from "../lib/logger";

const MyApp = ({ Component, pageProps }) => (
  <Base>
    <Component {...pageProps} />
  </Base>
);
MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const defaultProps = appContext.Component.defaultProps;
  logMessage.info(
    `Path: ${appContext.ctx.pathname} Query: ${JSON.stringify(
      appContext.ctx.query
    )}`
  );
  if (appContext.ctx.err) {
    logMessage.error(appContext.ctx.err);
  }
  return {
    ...appProps,
    pageProps: {
      namespacesRequired: [
        ...(appProps.pageProps.namespacesRequired || ["common"]),
        ...(defaultProps?.i18nNamespaces || []),
      ],
    },
  };
};

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
export default appWithTranslation(MyApp);
