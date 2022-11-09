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
    <section
      id={id}
      role="tabpanel"
      aria-labelledby={labeledbyId}
      className={isActive ? "" : "hidden"}
    >
      {children}
    </section>
  );
};
