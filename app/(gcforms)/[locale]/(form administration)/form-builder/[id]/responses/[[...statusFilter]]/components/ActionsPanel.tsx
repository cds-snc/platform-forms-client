"use client";
import React from "react";

export const ActionsPanel = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="fixed bottom-0 left-0 z-100 h-32 w-full border-t-2 border-black bg-white py-8">
      <div className="mx-20 tablet:mx-24">
        <div className="">{children}</div>
      </div>
    </section>
  );
};
