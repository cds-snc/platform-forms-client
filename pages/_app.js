import React from "react";
import PropTypes from "prop-types";
import { appWithTranslation } from "next-i18next";
import Base from "../components/globals/Base";
import "../styles/app.scss";

const MyApp = ({ Component, pageProps }) => (
  <Base>
    <Component {...pageProps} />
  </Base>
);

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
export default appWithTranslation(MyApp);
