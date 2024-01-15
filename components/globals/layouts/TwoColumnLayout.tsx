import React from "react";
import { ToastContainer } from "@components/form-builder/app/shared/Toast";
import SkipLink from "../SkipLink";
import { Header } from "../Header";
import { User } from "next-auth";
import { HeadMeta } from "./HeadMeta";
import { cn } from "@lib/utils";
import Footer from "../Footer";
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
      <div className="flex h-full flex-col">
        <SkipLink />

        <Header context={context} user={user} />
        <div className="shrink-0 grow basis-auto">
          <ToastContainer containerId="default" />
          <ToastContainer limit={1} containerId="wide" autoClose={false} width="600px" />
          <>
            <div>
              <div className="flex flex-row gap-10">
                <div id="left-nav" className="sticky top-10 z-10">
                  {leftColumnContent}
                </div>
                <main
                  id="content"
                  className={cn("w-full", context === "formBuilder" && "form-builder")}
                >
                  {children}
                </main>
              </div>
            </div>
          </>
        </div>

        <Footer displayFormBuilderFooter />
      </div>
    </>
  );
};
