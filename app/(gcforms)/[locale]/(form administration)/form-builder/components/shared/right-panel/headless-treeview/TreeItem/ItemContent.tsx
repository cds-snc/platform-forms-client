import { cn } from "@lib/utils";
import { ReactNode } from "react";

import { TreeItemData, TreeItemInstance } from "../types";

import { useStyles } from "../hooks/useStyles";
import { useElementType } from "../hooks/useElementType";

export const ItemContent = ({
  item,
  children,
}: {
  item: TreeItemInstance<TreeItemData>;
  children: ReactNode;
}) => {
  const { itemIndent, itemSpacing, formElementClasses, sectionElementClasses } = useStyles(item);
  const { isFormElement, isSectionElement } = useElementType(item);

  return (
    <div
      className={cn(
        itemIndent,
        itemSpacing,
        !item.isExpanded() && isSectionElement && "border-b-1 border-slate-300"
      )}
    >
      <div
        className={cn(
          isFormElement && formElementClasses,
          isSectionElement && sectionElementClasses
        )}
      >
        {children}
      </div>
    </div>
  );
};
