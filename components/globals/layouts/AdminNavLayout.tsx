import React from "react";
import PropTypes from "prop-types";
import Footer from "../Footer";
import Head from "next/head";
import SkipLink from "../SkipLink";
import { User } from "next-auth";

import { LeftNavigation } from "@components/admin/LeftNav/LeftNavigation";
import { useAccessControl } from "@lib/hooks";
import { Header } from "../Header";
import { TwoColumnLayout } from "./TwoColumnLayout";
import { FullWidthLayout } from "./FullWidthLayout";

interface AdminNavLayoutProps extends React.PropsWithChildren {
  user: User;
  backLink?: React.ReactElement;
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

      {hideLeftNav ? (
        <FullWidthLayout>{children}</FullWidthLayout>
      ) : (
        <TwoColumnLayout
          leftNav={
            <>
              {backLink}
              <LeftNavigation />
            </>
          }
        >
          {children}
        </TwoColumnLayout>
      )}

      <Footer displayFormBuilderFooter />
    </div>
  );
};

AdminNavLayout.propTypes = {
  children: PropTypes.object.isRequired,
};

export default AdminNavLayout;
