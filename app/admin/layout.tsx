import React from "react";
import PropTypes from "prop-types";

interface AdminNavLayoutProps extends React.PropsWithChildren {}

const AdminNavLayout = ({ children }: AdminNavLayoutProps) => {
  return (
    <div className="flex h-full flex-col">
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
