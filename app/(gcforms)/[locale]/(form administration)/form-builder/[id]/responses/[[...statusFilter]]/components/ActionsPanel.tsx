"use client";
import React from "react";

export const ActionsPanel = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="fixed bottom-0 left-[61px] z-100 h-32 w-full border-t-2 border-black bg-white py-8">
      <div className="mx-12">
        <div className="">{children}</div>
      </div>
    </section>
  );
};
