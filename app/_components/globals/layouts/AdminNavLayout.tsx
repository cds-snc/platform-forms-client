import React from "react";
import PropTypes from "prop-types";
import Footer from "../Footer";
import Head from "next/head";
import SkipLink from "../SkipLink";
import { User } from "next-auth";

import { LeftNavigation } from "@appComponents/admin/LeftNav/LeftNavigation";
import { ToastContainer } from "@appComponents/form-builder/app/shared/Toast";
import { useAccessControl } from "@lib/hooks";
import { Header } from "../Header";

interface AdminNavLayoutProps extends React.PropsWithChildren {
  user: User;
  backLink?: React.ReactNode;
  hideLeftNav?: boolean | false;
}

const AdminNavLayout = ({ children, user, backLink, hideLeftNav }: AdminNavLayoutProps) => {
  // This will check to see if a user is deactivated and redirect them to the account deactivated page
  useAccessControl();
  return (
    <div className={`flex h-full flex-col ${hideLeftNav && "bg-gray-50"}`}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </Head>

      <SkipLink />

      <Header context="admin" user={user} />

      <div className="page-container mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
        {backLink && <nav className="absolute">{backLink}</nav>}
        {!backLink && !hideLeftNav && <LeftNavigation />}
        <main id="content" className={!hideLeftNav ? "ml-60" : ""}>
          {children}
          <ToastContainer />
        </main>
      </div>

      <Footer displayFormBuilderFooter />
    </div>
  );
};

AdminNavLayout.propTypes = {
  children: PropTypes.object.isRequired,
};

export default AdminNavLayout;
