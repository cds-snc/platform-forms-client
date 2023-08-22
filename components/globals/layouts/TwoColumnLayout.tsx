import React from "react";
import Head from "next/head";

import { useAccessControl } from "@lib/hooks/useAccessControl";
import { ToastContainer } from "@components/form-builder/app/shared/Toast";

export const TwoColumnLayout = ({
  children,
  title,
  leftNav,
}: {
  children: React.ReactNode;
  title: string;
  leftNav?: React.ReactElement;
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
          <div className="flex flex-row gap-16">
            <div className="min-w-[240px]">{leftNav}</div>

            <main id="content" className="form-builder w-full">
              {children}
            </main>
          </div>
        </div>
      </>
    </div>
  );
};
