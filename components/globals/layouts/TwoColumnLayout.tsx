import React from "react";

import { ToastContainer } from "@components/form-builder/app/shared/Toast";

export const TwoColumnLayout = ({
  children,
  leftNav,
}: {
  children: React.ReactNode;
  leftNav?: React.ReactNode;
}) => {
  return (
    <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
      <ToastContainer />
      <>
        <div>
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
