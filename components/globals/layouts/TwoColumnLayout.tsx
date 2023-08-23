import React from "react";

import { ToastContainer } from "@components/form-builder/app/shared/Toast";
import SkipLink from "../SkipLink";
import { Header } from "../Header";
import { User } from "next-auth";
import { HeadMeta } from "./HeadMeta";

export const TwoColumnLayout = ({
  children,
  leftColumnContent,
  user,
  context,
}: {
  children: React.ReactNode;
  leftColumnContent?: React.ReactNode;
  user?: User;
  context?: "admin" | "formBuilder" | "default";
}) => {
  return (
    <>
      <HeadMeta />
      <SkipLink />

      <Header context={context} user={user} />

      <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
        <ToastContainer />
        <>
          <div>
            <div className="flex flex-row gap-16">
              <div className="min-w-[175px]">{leftColumnContent}</div>

              <main id="content" className="form-builder w-full">
                {children}
              </main>
            </div>
          </div>
        </>
      </div>
    </>
  );
};
