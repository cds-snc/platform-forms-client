import "react-app-polyfill/ie9";

import React from "react";
import PropTypes from "prop-types";
import { appWithTranslation } from "next-i18next";
import { Provider } from "next-auth/client";
import Base from "../components/globals/Base";
import "../styles/app.scss";
import { useHMR } from "../lib/trans_hmr";
import i18nextConfig from "../next-i18next.config";

const MyApp = ({ Component, pageProps }) => {
  useHMR();
  return (
    <Provider session={pageProps.session}>
      <Base>
        <Component {...pageProps} />
      </Base>
    </Provider>
  );
};

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
export default appWithTranslation(MyApp, i18nextConfig);
