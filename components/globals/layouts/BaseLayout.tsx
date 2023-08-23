import React from "react";
import PropTypes from "prop-types";
import Footer from "../Footer";
import SkipLink from "../SkipLink";
import Fip from "../Fip";
import { HeadMeta } from "./HeadMeta";

interface BaseProps extends React.PropsWithChildren {
  showLanguageToggle?: boolean;
  showLogin?: boolean;
  className?: string;
}

export const Layout = ({ children, showLanguageToggle, showLogin, className }: BaseProps) => {
  return (
    <>
      <header>
        <Fip {...{ showLanguageToggle, showLogin }} />
      </header>
      <div id="page-container" className={className}>
        <main id="content">{children}</main>
      </div>
      <Footer />
    </>
  );
};

const Base = ({ children, showLanguageToggle, showLogin }: BaseProps) => {
  return (
    <div className="flex flex-col h-full">
      <HeadMeta />
      <SkipLink />

      <header>
        <Fip {...{ showLanguageToggle, showLogin }} />
      </header>
      <div id="page-container">
        <main id="content">{children}</main>
      </div>

      <Footer />
    </div>
  );
};

Base.propTypes = {
  children: PropTypes.object.isRequired,
};

export default Base;
