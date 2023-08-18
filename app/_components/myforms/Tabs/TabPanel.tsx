import React from "react";

export interface TabPanelProps {
  children: React.ReactNode;
  id: string;
  labeledbyId: string;
  isActive: boolean;
}

export const TabPanel = (props: TabPanelProps): React.ReactElement => {
  const { children, id, labeledbyId, isActive = false } = props;

  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={labeledbyId}
      className={`pt-8 ${isActive ? "" : "hidden"}`}
    >
      {children}
    </div>
  );
};
