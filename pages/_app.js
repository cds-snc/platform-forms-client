import App from "next/app";
import { appWithTranslation } from "../i18n";
import Base from "../components/globals/Base";
import "../styles/app.scss";

const MyApp = ({ Component, pageProps }) => (
  <Base>
    <Component {...pageProps} />
  </Base>
);
MyApp.getInitialProps = async (appContext) => ({
  ...(await App.getInitialProps(appContext)),
});

export default appWithTranslation(MyApp);
