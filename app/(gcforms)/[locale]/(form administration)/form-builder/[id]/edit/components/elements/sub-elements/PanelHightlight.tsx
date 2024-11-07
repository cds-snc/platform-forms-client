"use client";
import React from "react";

import { useIsWithin } from "@lib/hooks/form-builder/useIsWithin";
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
        "pl-8 panel-actions border-b-1 border-slate-500 transition-all duration-800"
      )}
    >
      <div className="mx-4">{children}</div>
      <div
        className={cn(
          "block opacity-0 transition-opacity duration-300",
          isWithin ? "opacity-100" : "opacity-0"
        )}
      >
        {conditionalChildren}
      </div>
    </div>
  );
};
