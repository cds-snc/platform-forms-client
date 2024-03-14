"use client";
import React from "react";

export const FieldsetLegend = ({ children }: { children: React.ReactNode }) => {
  return (
    <legend className="w-full border border-b-0 border-gray-300 bg-gray-100 p-2 text-sm">
      {children}
    </legend>
  );
};
