import React from "react";
import PropTypes from "prop-types";
import Footer from "../Footer";
import { User } from "next-auth";

import { LeftNavigation } from "@components/admin/LeftNav/LeftNavigation";
import { useAccessControl } from "@lib/hooks";
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
      {hideLeftNav ? (
        <FullWidthLayout user={user} context="admin">
          {children}
        </FullWidthLayout>
      ) : (
        <TwoColumnLayout
          user={user}
          context="admin"
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
