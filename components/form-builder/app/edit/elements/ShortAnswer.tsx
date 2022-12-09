import React from "react";

export const ShortAnswer = ({ children, ...props }: { children: string }) => {
  return (
    <div {...props} className="mt-5 border-bottom-1 border-dotted border-gray-400">
      {children}
    </div>
  );
};
