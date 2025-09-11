import { cn } from "@lib/utils";
import React from "react";

import { TreeItemProps } from "../types";

import { useScrollIntoView } from "../hooks/useScrolntoView";
import { useElementType } from "../hooks/useElementType";

import { ItemContent } from "./ItemContent";
import { ItemTitle } from "./ItemTitle";
import { ItemIcon } from "./ItemIcon";
import { DragHandle } from "./DragHandle";
import { EditableInput } from "./EditableInput";

import { DeleteIcon } from "@serverComponents/icons";

export const TreeItem = ({ item, tree, onFocus, handleDelete }: TreeItemProps) => {
  const { isFormElement, isSectionElement, isRepeatingSet } = useElementType(item);
  const handleScroll = useScrollIntoView();

  const { canDrag } = tree.getConfig();
  const canDragItem = canDrag ? canDrag([item]) : true;

  return (
    <div
      key={item.getId()}
      id={item.getId()}
      {...(!item.isRenaming() && {
        ...item.getProps(),
        onFocus: () => {
          onFocus(item);
        },
        onClick: (e: React.MouseEvent) => {
          handleScroll(item);
          item.getProps().onClick(e);
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
        <ItemIcon item={item} />

        {item.isRenaming() ? <EditableInput item={item} tree={tree} /> : <ItemTitle item={item} />}

        {item.isExpanded() && handleDelete && !isFormElement && !isRepeatingSet && (
          <button className="cursor-pointer" onClick={handleDelete}>
            <DeleteIcon title="Delete group" className="mr-2 scale-50" />
          </button>
        )}

        {isFormElement && <DragHandle canDragItem={canDragItem} />}
      </ItemContent>
    </div>
  );
};
