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

export const TreeItem = ({ item, tree, onFocus, handleDelete }: TreeItemProps) => {
  const { isFormElement, isSectionElement, isRepeatingSet } = useElementType(item);

  const { canDrag } = tree.getConfig();
  const canDragItem = isFormElement ? (canDrag ? canDrag([item]) : true) : false;

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
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Delete" || e.key === "Backspace") {
            if (handleDelete) {
              e.preventDefault();
              handleDelete(e as React.KeyboardEvent<HTMLDivElement>);
            }
          }
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

        {canDeleteItem && (
          <button className="cursor-pointer" onClick={handleDelete}>
            <DeleteIcon title="Delete group" className="mr-2 scale-50" />
          </button>
        )}

        {canDragItem && <DragHandle canDragItem={canDragItem} />}
      </ItemContent>
    </div>
  );
};
