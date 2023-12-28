import React from "react";

export const FieldsetLegend = ({ children }: { children: React.ReactNode }) => {
  return (
    <legend className="text-sm p-2 border border-b-0 border-gray-300 bg-gray-100 w-full">
      {children}
    </legend>
  );
};
