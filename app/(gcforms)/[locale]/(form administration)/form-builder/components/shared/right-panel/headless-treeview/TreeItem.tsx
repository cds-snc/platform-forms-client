import { cn } from "@lib/utils";
import React from "react";

import { TreeItemProps } from "./types";

import { ArrowDown } from "./icons/ArrowDown";
import { ArrowRight } from "./icons/ArrowRight";
import { ItemActions } from "./ItemActions";
import { ItemTitle } from "./ItemTitle";
import { Hamburger } from "./icons/Hamburger";

import { useScrollIntoView } from "./hooks/useScrolntoView";
import { useElementType } from "./hooks/useElementType";
import { useStyles } from "./hooks/useStyles";

export const TreeItem = ({ item, tree, onFocus, handleDelete }: TreeItemProps) => {
  const { isFormElement, isSectionElement, isRepeatingSet, fieldType } = useElementType(item);
  const { itemIndent, itemSpacing, formElementClasses, sectionElementClasses } = useStyles(item);
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
      <div className={cn(itemIndent)}>
        <div
          className={cn(
            itemSpacing,
            !item.isExpanded() && isSectionElement && "border-b-1 border-slate-300"
          )}
        >
          <div
            data-selected={item.isSelected()}
            data-focused={item.isFocused()}
            className={cn(
              isFormElement && formElementClasses,
              isSectionElement && sectionElementClasses
            )}
          >
            {isSectionElement && (
              <span className="mx-2 inline-block">
                {item.isExpanded() ? <ArrowDown /> : <ArrowRight />}
              </span>
            )}
            {isRepeatingSet && (
              <span className="mr-2 inline-block">
                <Hamburger />
              </span>
            )}
            {item.isRenaming() && (
              <div key={item.getId()} className="w-5/6">
                <input
                  className="m-2 block w-full select-all rounded-md border-2 border-indigo-700 p-2 font-normal outline-none"
                  {...item.getRenameInputProps()}
                  autoFocus
                  onFocus={(e) => {
                    e.target.select();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      tree.completeRenaming();
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      tree.abortRenaming();
                    }
                  }}
                  onBlur={() => {
                    tree.completeRenaming();
                  }}
                />
              </div>
            )}

            {!item.isRenaming() && (
              <>
                <ItemTitle
                  isFolder={item.isFolder() || item.getItemData().isRepeatingSet || false}
                  title={item.getItemName()}
                  isFormElement={isFormElement}
                  fieldType={fieldType}
                  id={item.getId()}
                />
                <ItemActions
                  item={item}
                  tree={tree}
                  arrow={undefined}
                  lockClassName={""}
                  handleDelete={isRepeatingSet ? undefined : handleDelete}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
