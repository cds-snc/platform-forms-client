import React from "react";
import App from "next/app";
import { appWithTranslation } from "../i18n";
import Base from "../components/globals/Base";
import "../styles/app.scss";

const MyApp = ({ Component, pageProps }) => (
  <Base>
    <Component {...pageProps} />
  </Base>
);
MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const defaultProps = appContext.Component.defaultProps;
  return {
    ...appProps,
    pageProps: {
      namespacesRequired: [
        ...(appProps.pageProps.namespacesRequired || []),
        ...(defaultProps?.i18nNamespaces || []),
      ],
    },
  };
};

export default appWithTranslation(MyApp);
