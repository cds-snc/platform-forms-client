import React, { useEffect, useRef, useState } from "react";
import { TabsKeynav } from "@components/myforms/Tabs/TabsKeynav";

export interface TabsProps {
  children: Array<React.ReactNode>;
  labeledby: string;
}

export const TabsList = (props: TabsProps): React.ReactElement => {
  const { children, labeledby } = props;
  const tabsListRef = useRef<HTMLDivElement>(null);
  const [tabsKeynav, setTabsKeynav] = useState({} as TabsKeynav);

  useEffect(() => {
    if (tabsListRef.current) {
      setTabsKeynav(
        new TabsKeynav({
          tabsListEl: tabsListRef.current,
        })
      );
    }
  }, [tabsListRef.current]);

  // Note: the only purpose of the tabIndex is to have the eslint tests pass
  return (
    <div
      className="gc-horizontal-list mb-14"
      ref={tabsListRef}
      role="tablist"
      aria-labelledby={labeledby}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        tabsKeynav.onKey(e as unknown as KeyboardEvent);
      }}
      tabIndex={-1}
    >
      {children &&
        children?.length > 0 &&
        children.map((child, index) => {
          return (
            <div className="gc-horizontal-item" key={`key-${index}-${labeledby}`}>
              {child}
            </div>
          );
        })}
    </div>
  );
};
