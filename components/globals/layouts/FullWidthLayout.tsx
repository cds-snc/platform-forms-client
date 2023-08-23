import React from "react";

import { useAccessControl } from "@lib/hooks/useAccessControl";
import { ToastContainer } from "@components/form-builder/app/shared/Toast";

export const FullWidthLayout = ({ children }: { children: React.ReactNode }) => {
  // This will check to see if a user is deactivated and redirect them to the account deactivated page
  useAccessControl(); // @TODO: this belongs somewhere else

  // Wait until the Template Store has fully hydrated before rendering the page
  return (
    <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
      <ToastContainer />
      <>
        <div>
          <main id="content" className="form-builder">
            {children}
          </main>
        </div>
      </>
    </div>
  );
};
