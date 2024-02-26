import React from "react";
// import { useAccessControl } from "@lib/hooks/useAccessControl";
import { ToastContainer } from "@clientComponents/form-builder/app/shared/Toast";

import { Footer, Header, SkipLink } from "@clientComponents/globals";

export default function FormsLayout({
  children,
  user,
  context,
}: {
  children: React.ReactNode;
  user?: { name: string | null; email: string };
  context?: "admin" | "formBuilder" | "default";
}) {
  // TODO
  // This will check to see if a user is deactivated and redirect them to the account deactivated page
  // useAccessControl(); // @TODO: this belongs somewhere else

  // Wait until the Template Store has fully hydrated before rendering the page
  return (
    <>
      <div className="flex h-full flex-col">
        <SkipLink />

        <Header context={context} user={user && { email: user.email, name: user.name }} />
        <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
          <ToastContainer />
          <>
            <div>
              <main id="content">{children}</main>
            </div>
          </>
        </div>
        <Footer displayFormBuilderFooter />
      </div>
    </>
  );
}
