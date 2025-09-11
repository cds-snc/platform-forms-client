import { cn } from "@lib/utils";
import React from "react";

import { TreeItemProps } from "../types";

import { useScrollIntoView } from "../hooks/useScrolntoView";
import { useElementType } from "../hooks/useElementType";

import { ItemIcon } from "./ItemIcon";
import { EditableInput } from "./EditableInput";
import { ItemActions } from "./ItemActions";
import { ItemTitle } from "./ItemTitle";

import { ItemContainer } from "./ItemContainer";

export const TreeItem = ({ item, tree, onFocus, handleDelete }: TreeItemProps) => {
  const { isFormElement, isSectionElement, isRepeatingSet, fieldType } = useElementType(item);
  const handleScroll = useScrollIntoView();

  return (
    <div
      key={item.getId()}
      id={item.getId()}
      {...(!item.isRenaming() && {
        ...item.getProps(),
        onFocus: () => {
          onFocus(item);
          handleScroll(item);
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
      <ItemContainer item={item}>
        <>
          <ItemIcon item={item} />

          {item.isRenaming() ? (
            <EditableInput item={item} tree={tree} />
          ) : (
            <ItemTitle
              isFolder={item.isFolder() || item.getItemData().isRepeatingSet || false}
              title={item.getItemName()}
              isFormElement={isFormElement}
              fieldType={fieldType}
              id={item.getId()}
            />
          )}

          <ItemActions
            item={item}
            tree={tree}
            arrow={undefined}
            lockClassName={""}
            handleDelete={isRepeatingSet ? undefined : handleDelete}
          />
        </>
      </ItemContainer>
    </div>
  );
};
