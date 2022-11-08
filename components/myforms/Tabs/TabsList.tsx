import React, { useEffect, useRef, useState } from "react";
import { Tabs } from "@components/myforms/Tabs/Tabs";

export interface TabsProps {
  children: Array<React.ReactNode>;
  labeledby: string;
}

// TODO: add keynav left and right keys and focus to first card on activate
export const TabsList = (props: TabsProps): React.ReactElement => {
  const { children, labeledby } = props;
  const tabsListRef = useRef<HTMLUListElement>(null);
  const [tabs, setTabs] = useState({} as Tabs);

  useEffect(() => {
    if (tabsListRef.current) {
      setTabs(
        new Tabs({
          tabsListEl: tabsListRef.current,
        })
      );
    }
  }, [tabsListRef.current]);

  return (
    <nav className="mb-14">
      <ul
        className="gc-horizontal-list"
        role="tablist"
        aria-labelledby={labeledby}
        ref={tabsListRef}
      >
        {children &&
          children?.length > 0 &&
          children.map((child, index) => {
            return (
              <li className="gc-horizontal-item" key={`key-${index}-${labeledby}`}>
                {child}
              </li>
            );
          })}
      </ul>
    </nav>
  );
};
