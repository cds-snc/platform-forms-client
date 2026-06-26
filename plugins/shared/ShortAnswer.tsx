"use client";
import React from "react";

/**
 * Renders a styled placeholder text used in the form builder's right-panel
 * preview to show what an element looks like with example input.
 */
export const ShortAnswer = ({ children, ...props }: { children: React.ReactElement | string }) => {
  return (
    <div
      {...props}
      className="example-text border-b-1.5 mt-3 border-solid border-gray-200 text-slate-600"
    >
      {children}
    </div>
  );
};
