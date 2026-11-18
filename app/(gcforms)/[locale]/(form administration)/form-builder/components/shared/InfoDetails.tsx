"use client";
import { AddIcon, RemoveIcon } from "@serverComponents/icons";
import React from "react";

export const InfoDetails = ({
  summary,
  expandedSummary,
  children,
  className,
}: {
  summary: string;
  expandedSummary?: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <details className="group" onToggle={(event) => setIsOpen(event.currentTarget.open)}>
      <summary
        className={`border-white-default hover:border-black-default hover:text-white-default focus:bg-blue-focus focus:text-white-default focus:outline-blue-focus inline-block cursor-pointer list-none rounded-lg border-2 p-2 hover:bg-gray-600 focus:outline focus:outline-[3px] focus:outline-offset-2 hover:[&_svg]:fill-white focus:[&_svg]:fill-white [&::-webkit-details-marker]:hidden ${className}`}
      >
        {isOpen ? (expandedSummary ?? summary) : summary}
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
