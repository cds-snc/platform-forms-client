import React from "react";
import { TemplateStoreProvider } from "@components/form-builder/store";
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
        {/* Noting the provider is needed here for deleting forms */}
        <TemplateStoreProvider>
          <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
            <ToastContainer />
            <>
              <div>
                <div className="flex flex-row gap-10">
                  <div className="min-w-[181px]">{leftColumnContent}</div>

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
        </TemplateStoreProvider>
        <Footer displayFormBuilderFooter />
      </div>
    </>
  );
};
