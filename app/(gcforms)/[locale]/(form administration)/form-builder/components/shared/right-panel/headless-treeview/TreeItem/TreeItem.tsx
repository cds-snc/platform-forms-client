import { cn } from "@lib/utils";
import React from "react";

import { TreeItemProps } from "../types";

import { useElementType } from "../hooks/useElementType";

import { ItemContent } from "./ItemContent";
import { ItemTitle } from "./ItemTitle";
import { ExpandableIcon } from "./ExpandableIcon";
import { DragHandle } from "./DragHandle";
import { EditableInput } from "./EditableInput";
import { DeleteIcon } from "@serverComponents/icons";
import { lockedItems } from "../TreeView";

export const TreeItem = ({ item, tree, onFocus, handleDelete }: TreeItemProps) => {
  const { isFormElement, isSectionElement, isRepeatingSet } = useElementType(item);

  const canDragItem = !lockedItems.includes(item.getId());

  const canDeleteItem =
    item.isExpanded() &&
    handleDelete &&
    !isFormElement &&
    !isRepeatingSet &&
    !["start", "end"].includes(item.getId());

  return (
    <div
      key={item.getId()}
      id={item.getId()}
      {...(!item.isRenaming() && {
        ...item.getProps(),
        onFocus: () => {
          onFocus(item);
        },
        onDoubleClick: (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          tree.getItemInstance(item.getId()).startRenaming();
        },
      })}
      className={cn(
        "block max-w-full",
        isFormElement && "outline-none",
        isSectionElement && "outline-indigo-700 outline-offset-[-4px]"
      )}
    >
      <ItemContent item={item}>
        <ExpandableIcon item={item} />

        {item.isRenaming() ? <EditableInput item={item} tree={tree} /> : <ItemTitle item={item} />}

        {!item.isRenaming() && <DragHandle canDragItem={canDragItem} />}

        {canDeleteItem && (
          <button className="mr-2 inline-block w-[24px] cursor-pointer" onClick={handleDelete}>
            <DeleteIcon title="Delete group" className="scale-50" />
          </button>
        )}
      </ItemContent>
    </div>
  );
};
