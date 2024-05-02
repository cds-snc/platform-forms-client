import React from "react";

export const ShortAnswer = ({ children, ...props }: { children: React.ReactElement | string }) => {
  return (
    <div
      {...props}
      className="example-text mt-3 border-b-1.5 border-solid border-gray-200 text-slate-600"
    >
      {children}
    </div>
  );
};
