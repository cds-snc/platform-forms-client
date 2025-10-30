"use client";

import { ToastContainer } from "@formBuilder/components/shared/Toast";

export const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="account-wrapper">
      <div className="w-[622px] rounded-2xl border-1 border-[#D1D5DB] bg-white p-10">
        <main id="content w-full">
          <div>{children}</div>
          <ToastContainer autoClose={false} containerId="response-api" />
        </main>
      </div>
    </div>
  );
};
