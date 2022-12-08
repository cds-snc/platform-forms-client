import React from "react";

export const SectionTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mt-8 mb-6 flex">
      <h2 className="text-[24px] m-0 p-0 pr-4">{children}</h2>
      <hr className="border mt-5 border-black border-dotted flex grow" />
    </div>
  );
};
