import React from "react";
import Head from "next/head";

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
  return (
    <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
      <ToastContainer />
      <>
        <div>
          <Head>
            <title>{title}</title>
          </Head>
          <div className="flex flex-row gap-16">
            <div className="min-w-[210px]">{leftNav}</div>

            <main id="content" className="form-builder w-full">
              {children}
            </main>
          </div>
        </div>
      </>
    </div>
  );
};
