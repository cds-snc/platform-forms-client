import React from "react";

export interface TabsProps {
  children: Array<React.ReactNode>;
  labeledby: string;
}

// TODO: add keynav left and right keys and focus to first card on activate
export const Tabs = (props: TabsProps): React.ReactElement => {
  const { children, labeledby } = props;

  return (
    <nav className="mb-14">
      <ul className="gc-horizontal-list" role="tablist" aria-labelledby={labeledby}>
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
