"use client";
import React from "react";

export const NumberInputBuilderPreview = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className="example-text border-b-1.5 mt-3 border-solid border-gray-200 text-slate-600"
      {...props}
    >
      0123456789
    </div>
  );
};
