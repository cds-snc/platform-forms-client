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
  }, []);

  // Note: the only purpose of the tabIndex is to have the eslint tests pass
  return (
    <div
      className="lg:flex-col lg:text-small_base p-0 flex text-base list-none mb-14"
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
            <div className="lg:pr-0 lg:pb-4 pr-8 pb-0" key={`key-${index}-${labeledby}`}>
              {child}
            </div>
          );
        })}
    </div>
  );
};
