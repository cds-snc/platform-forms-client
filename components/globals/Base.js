import Head from "next/head";
import Footer from "./Footer";
import PhaseBanner from "./PhaseBanner";
import SkipLink from "./SkipLink";
import Fip from "./Fip";

const Base = (props) => {
  return (
    <>
      <Head>
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
        <header className="mb-20">
          <PhaseBanner />
          <Fip />
        </header>
        <main id="content">{props.children}</main>
        <Footer />
      </div>
    </>
  );
};

export default Base;
