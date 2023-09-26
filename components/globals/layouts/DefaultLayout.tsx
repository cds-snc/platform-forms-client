import React from "react";
import PropTypes from "prop-types";
import Footer from "../Footer";
import SkipLink from "../SkipLink";
import Fip from "../Fip";
import { HeadMeta } from "./HeadMeta";
import LanguageToggle from "../LanguageToggle";
import LoginMenu from "@components/auth/LoginMenu";

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
        <Fip>
          {showLanguageToggle && <LanguageToggle />}
          {showLogin && <LoginMenu />}
        </Fip>
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
        <Fip className={isSplashPage ? "my-0 py-6" : "mb-20 mt-0 border-b-4 border-blue-dark py-9"}>
          {showLanguageToggle && <LanguageToggle />}
          {showLogin && <LoginMenu />}
        </Fip>
      </header>
      <div id="page-container" className="gc-formview">
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
