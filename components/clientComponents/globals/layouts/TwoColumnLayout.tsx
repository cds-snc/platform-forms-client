"use client";
import React from "react";
import { ToastContainer } from "@clientComponents/form-builder/app/shared/Toast";
import { SkipLink, Footer } from "@clientComponents/globals";
import { Header } from "../Header";
import { User } from "next-auth";
import { cn } from "@lib/utils";

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
      <div className="flex h-full flex-col">
        <SkipLink />

        <Header context={context} user={user} className="mb-0" />
        <div className="shrink-0 grow basis-auto">
          <ToastContainer containerId="default" />
          <ToastContainer limit={1} containerId="wide" autoClose={false} width="600px" />
          <>
            <div>
              <div className="flex flex-row gap-10 pr-12">
                <div
                  id="left-nav"
                  className="sticky top-5 z-10 flex max-h-max border-r border-slate-200 bg-white"
                >
                  {leftColumnContent}
                </div>
                <main
                  id="content"
                  className={cn(
                    "w-full",
                    context === "formBuilder" && "form-builder",
                    "mt-5 mb-10"
                  )}
                >
                  {children}
                </main>
              </div>
            </div>
          </>
        </div>

        <Footer displayFormBuilderFooter className="mt-0 lg:mt-0" />
      </div>
    </>
  );
};
