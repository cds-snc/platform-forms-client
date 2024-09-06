"use client";
import React from "react";

import { useIsWithin } from "@lib/hooks/form-builder";
import { cn } from "@lib/utils";

export const PanelHightLight = ({
  children,
  conditionalChildren,
}: {
  children: React.ReactNode;
  conditionalChildren: React.ReactNode;
}) => {
  const { focusWithinProps, isWithin } = useIsWithin();
  return (
    <div
      {...focusWithinProps}
      className={cn(
        isWithin && "bg-violet-100",
        "px-5 panel-actions border-b-1 border-slate-500 transition-all duration-800"
      )}
    >
      <div className="mx-4">{children}</div>
      <div
        className={cn(
          "block laptop:opacity-0 laptop:transition-opacity laptop:duration-300",
          isWithin ? "laptop:opacity-100" : "laptop:opacity-0"
        )}
      >
        {conditionalChildren}
      </div>
    </div>
  );
};
