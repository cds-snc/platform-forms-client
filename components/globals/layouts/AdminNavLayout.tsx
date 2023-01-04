import React from "react";
import PropTypes from "prop-types";
import Footer from "../Footer";
import Head from "next/head";
import SkipLink from "../SkipLink";
import AdminNav from "../AdminNav";
import { User } from "next-auth";

interface AdminNavLayoutProps extends React.PropsWithChildren {
  user: User;
}

const AdminNavLayout = ({ children, user }: AdminNavLayoutProps) => {
  return (
    <div className="flex flex-col h-full">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </Head>

      <SkipLink />

      <header>
        <AdminNav user={user} />
      </header>
      <div id="page-container">
        <main id="content" className="grow shrink-0 basis-auto">
          {children}
        </main>
      </div>

      <Footer displaySLAAndSupportLinks />
    </div>
  );
};

AdminNavLayout.propTypes = {
  children: PropTypes.object.isRequired,
};

export default AdminNavLayout;
