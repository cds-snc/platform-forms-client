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
      <ul
        className="flex flex-row gap-4 text-base list-none p-0"
        role="tablist"
        aria-labelledby={labeledby}
      >
        {children &&
          children?.length > 0 &&
          children.map((child, index) => {
            return <li key={`key-${index}-${labeledby}`}>{child}</li>;
          })}
      </ul>
    </nav>
  );
};
