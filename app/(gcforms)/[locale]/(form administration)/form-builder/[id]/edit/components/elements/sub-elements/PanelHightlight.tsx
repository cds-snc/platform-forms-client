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
  const highlight = isWithin
    ? "bg-violet-100 border-b-1 border-violet-100"
    : "border-b-1 border-slate-500";
  const transitionClasses = "transition-all duration-800";

  const actionPanelClasses = cn(
    "block laptop:hidden",
    isWithin ? "laptop:!block" : "laptop:!hidden"
  );

  return (
    <div {...focusWithinProps} className={cn(highlight, "px-5 panel-actions", transitionClasses)}>
      {children}
      <div className={actionPanelClasses}>{conditionalChildren}</div>
    </div>
  );
};
