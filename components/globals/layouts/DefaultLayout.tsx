import React from "react";
import PropTypes from "prop-types";
import Footer from "../Footer";
import SkipLink from "../SkipLink";
import Fip from "../Fip";
import { HeadMeta } from "./HeadMeta";

interface DefaultLayoutProps extends React.PropsWithChildren {
  showLanguageToggle?: boolean;
  showLogin?: boolean;
  className?: string;
  isSplashPage?: boolean;
}

export const Layout = ({
  children,
  showLanguageToggle,
  showLogin,
  className,
  isSplashPage = false,
}: DefaultLayoutProps) => {
  return (
    <>
      <header>
        <Fip {...{ showLanguageToggle, showLogin }} />
      </header>
      <div id="page-container" className={className}>
        <main id="content">{children}</main>
      </div>
      <Footer isSplashPage={isSplashPage} />
    </>
  );
};

const DefaultLayout = ({
  children,
  showLanguageToggle,
  showLogin,
  isSplashPage,
}: DefaultLayoutProps) => {
  return (
    <div className="flex h-full flex-col">
      <HeadMeta />
      <SkipLink />
      <header>
        <Fip {...{ showLanguageToggle, showLogin }} />
      </header>
      <div id="page-container">
        <main id="content">{children}</main>
      </div>
      <Footer isSplashPage={isSplashPage} />
    </div>
  );
};

DefaultLayout.propTypes = {
  children: PropTypes.object.isRequired,
};

export default DefaultLayout;
