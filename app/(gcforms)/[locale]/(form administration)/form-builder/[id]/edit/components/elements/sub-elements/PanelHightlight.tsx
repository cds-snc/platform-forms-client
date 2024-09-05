"use client";
import React from "react";

import { useIsWithin } from "@lib/hooks/form-builder";

export const PanelHightLight = ({
  children,
  conditionalChildren,
}: {
  children: React.ReactNode;
  conditionalChildren: React.ReactNode;
}) => {
  const { focusWithinProps, isWithin } = useIsWithin();
  const hightLight = isWithin ? "bg-violet-100" : "border-b-1 border-slate-500";
  return (
    <div {...focusWithinProps} className={`${hightLight} p-5 `}>
      {children}
      <div className={`block laptop:hidden ${isWithin ? "laptop:!block" : "laptop:!hidden"}`}>
        {conditionalChildren}
      </div>
    </div>
  );
};
