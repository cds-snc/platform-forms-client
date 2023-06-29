import React from "react";
import PropTypes from "prop-types";
import Footer from "../Footer";
import Head from "next/head";
import SkipLink from "../SkipLink";
import AdminNav from "../AdminNav";
import { User } from "next-auth";

import { LeftNavigation } from "@components/admin/LeftNav/LeftNavigation";
import { ToastContainer } from "@components/form-builder/app/shared/Toast";

interface AdminNavLayoutProps extends React.PropsWithChildren {
  user: User;
  backLink?: React.ReactNode;
}

const AdminNavLayout = ({ children, user, backLink }: AdminNavLayoutProps) => {
  return (
    <div className="flex h-full flex-col">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </Head>

      <SkipLink />

      <header className="mb-12 border-b-1 border-gray-500 px-4 py-2 laptop:px-32 desktop:px-64">
        <AdminNav user={user} />
      </header>

      <div className="page-container mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
        {backLink && <nav className="absolute">{backLink}</nav>}
        {!backLink && <LeftNavigation />}
        <main id="content" className="ml-40 laptop:ml-60">
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
