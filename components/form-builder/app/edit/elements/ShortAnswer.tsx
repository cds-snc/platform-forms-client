import React from "react";

export const ShortAnswer = ({ children, ...props }: { children: string }) => {
  return (
    <div {...props} className="text-hint">
      {children}
    </div>
  );
};
