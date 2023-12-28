import React from "react";

export const ActionsPanel = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="fixed bottom-0 left-0 h-32 w-full border-t-2 border-black bg-white py-8">
      <div className="mx-4 laptop:mx-32 desktop:mx-64">
        <div className="ml-[210px] flex gap-4">{children}</div>
      </div>
    </section>
  );
};
