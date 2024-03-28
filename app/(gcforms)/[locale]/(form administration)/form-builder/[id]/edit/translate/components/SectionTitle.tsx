"use client";
import React from "react";

export const SectionTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mb-4 mt-2 flex">
      <h2 className="m-0 p-0 pr-4 text-[24px]">{children}</h2>
      <hr className="mt-5 flex grow border border-dotted border-black" />
    </div>
  );
};
