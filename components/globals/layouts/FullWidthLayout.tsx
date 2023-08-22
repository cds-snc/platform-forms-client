import React from "react";
import Head from "next/head";

import { useAccessControl } from "@lib/hooks/useAccessControl";
import { ToastContainer } from "@components/form-builder/app/shared/Toast";

export const FullWidthLayout = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  // This will check to see if a user is deactivated and redirect them to the account deactivated page
  useAccessControl(); // @TODO: this belongs somewhere else

  // Wait until the Template Store has fully hydrated before rendering the page
  return (
    <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
      <ToastContainer />
      <>
        <div>
          <Head>
            <title>{title}</title>
          </Head>
          <main id="content" className="form-builder">
            {children}
          </main>
        </div>
      </>
    </div>
  );
};
