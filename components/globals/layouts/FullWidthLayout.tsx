import React from "react";

import { useAccessControl } from "@lib/hooks/useAccessControl";
import { ToastContainer } from "@components/form-builder/app/shared/Toast";
import SkipLink from "../SkipLink";
import { Header } from "../Header";
import { User } from "next-auth";
import { HeadMeta } from "./HeadMeta";

export const FullWidthLayout = ({
  children,
  user,
  context,
}: {
  children: React.ReactNode;
  user?: User;
  context?: "admin" | "formBuilder" | "default";
}) => {
  // This will check to see if a user is deactivated and redirect them to the account deactivated page
  useAccessControl(); // @TODO: this belongs somewhere else

  // Wait until the Template Store has fully hydrated before rendering the page
  return (
    <>
      <HeadMeta />
      <SkipLink />

      <Header context={context} user={user} />
      <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
        <ToastContainer />
        <>
          <div>
            <main id="content">{children}</main>
          </div>
        </>
      </div>
    </>
  );
};
