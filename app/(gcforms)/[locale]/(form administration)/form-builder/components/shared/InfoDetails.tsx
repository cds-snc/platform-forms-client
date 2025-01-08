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
        className={`inline-block cursor-pointer list-none rounded-lg border-2 border-white-default p-2 hover:border-black-default hover:bg-gray-600 hover:text-white-default focus:bg-blue-focus focus:text-white-default focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-blue-focus [&::-webkit-details-marker]:hidden [&_svg]:hover:fill-white [&_svg]:focus:fill-white ${className}`}
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
