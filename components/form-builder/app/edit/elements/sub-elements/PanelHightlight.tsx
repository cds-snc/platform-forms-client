import React from "react";

import { useIsWithin } from "@formbuilder/hooks/useIsWithin";

export const PanelHightLight = ({
  children,
  conditionalChildren,
}: {
  children: React.ReactNode;
  conditionalChildren: React.ReactNode;
}) => {
  const { focusWithinProps, isWithin } = useIsWithin();
  const hightLight = isWithin ? "bg-purple-100" : "";
  return (
    <div {...focusWithinProps} className={`px-5 py-1 ${hightLight}`}>
      {children}
      <div className={`${isWithin ? "" : "hidden"} xl:!block`}>{conditionalChildren}</div>
    </div>
  );
};
