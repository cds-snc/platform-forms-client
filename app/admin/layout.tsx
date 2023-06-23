import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import { User } from "next-auth";

interface AdminNavLayoutProps extends React.PropsWithChildren {
  user: User;
}

const AdminNavLayout = ({ children, user }: AdminNavLayoutProps) => {
  return (
    <div className="flex h-full flex-col">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </Head>
      <header className="mb-12 border-b-1 border-gray-500 px-4 py-2 laptop:px-32 desktop:px-64">
        test
      </header>
      <div className="page-container mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
        <main id="content" className="ml-40 laptop:ml-60">
          {children}
        </main>
      </div>
    </div>
  );
};

AdminNavLayout.propTypes = {
  children: PropTypes.object.isRequired,
};

export default AdminNavLayout;
