"use client";
import { AddIcon, RemoveIcon } from "@serverComponents/icons";
import React from "react";

export const InfoDetails = ({
  summary,
  children,
  className,
}: {
  summary: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <details className="group">
      <summary
        className={`inline-block p-2 list-none [&::-webkit-details-marker]:hidden cursor-pointer hover:text-white-default hover:bg-gray-600 focus:bg-blue-focus focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 border-white-default hover:border-black-default border-2 rounded-lg ${className}`}
      >
        {summary}
        <span className="inline group-open:hidden">
          <AddIcon className="inline pb-[2px]" />
        </span>
        <span className="hidden group-open:inline">
          <RemoveIcon className="inline pb-[2px]" />
        </span>
      </summary>
      {children}
    </details>
  );
};
