import React, { ReactElement } from "react";

export const LanguageLabel = ({ id, children }: { id: string; children: ReactElement }) => {
  return (
    <div
      id={id}
      className="absolute right-0 text-sm top-0 pl-2 pr-2 bg-purple-100 border-purple-200 border mr-1 -mt-6"
    >
      {children}
    </div>
  );
};
