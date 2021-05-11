import React from "react";
import PropTypes from "prop-types";
import { appWithTranslation } from "next-i18next";
import { Provider } from "next-auth/client";
import Base from "../components/globals/Base";
import "../styles/app.scss";

const MyApp = ({ Component, pageProps }) => (
  <Provider session={pageProps.session}>
    <Base>
      <Component {...pageProps} />
    </Base>
  </Provider>
);

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
export default appWithTranslation(MyApp);
