import React from "react";
import PropTypes from "prop-types";
import Footer from "../Footer";
import SkipLink from "../SkipLink";
import Fip from "../Fip";
import { HeadMeta } from "./HeadMeta";
import LanguageToggle from "../LanguageToggle";
import Menu from "@components/auth/LoginMenu";

interface DefaultLayoutProps extends React.PropsWithChildren {
  showLanguageToggle?: boolean;
  showLogin?: boolean;
  className?: string;
}

export const Layout = ({
  children,
  showLanguageToggle,
  showLogin,
  className,
}: DefaultLayoutProps) => {
  return (
    <>
      <header>
        <Fip>
          {showLanguageToggle && <LanguageToggle />}
          {showLogin && <Menu />}
        </Fip>
      </header>
      <div id="page-container" className={className}>
        <main id="content">{children}</main>
      </div>
      <Footer />
    </>
  );
};

const DefaultLayout = ({ children, showLanguageToggle, showLogin }: DefaultLayoutProps) => {
  return (
    <div className="flex h-full flex-col">
      <HeadMeta />
      <SkipLink />
      <header>
        <Fip>
          {showLanguageToggle && <LanguageToggle />}
          {showLogin && <Menu />}
        </Fip>
      </header>
      <div id="page-container">
        <main id="content">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

DefaultLayout.propTypes = {
  children: PropTypes.object.isRequired,
};

export default DefaultLayout;
