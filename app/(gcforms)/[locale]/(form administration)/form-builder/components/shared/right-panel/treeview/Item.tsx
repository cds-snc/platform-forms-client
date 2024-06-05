import React from "react";

import { cn } from "@lib/utils";
import { ReactElement, ReactNode } from "react";
import { TreeItem, TreeItemRenderContext } from "react-complex-tree";
import { ArrowRight } from "./icons/ArrowRight";
import { ArrowDown } from "./icons/ArrowDown";
import { EditableInput } from "./EditableInput";
import { ItemActions } from "./ItemActions";

export const Item = ({
  title,
  arrow,
  context,
  children,
  handleDelete,
}: {
  title: ReactNode;
  arrow: ReactNode;
  context: TreeItemRenderContext;
  children: ReactNode | ReactElement;
  handleDelete: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
}) => {
  const isRenaming = context && context?.isRenaming ? true : false;
  const isLocked = !context.canDrag;
  let isFormElement = false;
  let isGhostElement = false;
  let isSection = false;

  // Pull item from arrow props
  let item: TreeItem;
  if (arrow && typeof arrow === "object" && "props" in arrow) {
    item = arrow.props.item;
    isSection = item?.isFolder ? true : false;
    isFormElement = item?.isFolder ? false : true;
    isGhostElement = ["intro", "policy", "end"].includes(String(item?.index));
  }

  const isSectionClasses = cn("w-full relative");
  const formElementClasses = "inline-block w-full relative h-[60px]";
  const ghostElementClasses = "inline-block w-full relative h-[60px]";

  return (
    <li
      {...context.itemContainerWithChildrenProps}
      className={cn(
        "flex flex-col"
        //children && "bg-slate-50",
        // context.isDraggingOver && "!border-dashed !border-1 !border-blue-focus",
        // context.isSelected && "border-slate-950 !border-1 bg-white",
      )}
    >
      <>
        <div
          {...context.itemContainerWithoutChildrenProps}
          {...context.interactiveElementProps}
          className={cn(
            "text-left group relative w-full overflow-hidden truncate cursor-pointer h-[60px]",
            // isFormElement && !isGhostElement && !context.isDraggingOver && "bg-white",
            //isFormElement && !isGhostElement && !context.isDraggingOver && "border-slate-500 border-1 rounded-md",
            // "hover:border-indigo-700 hover:border-1",
            // context.isSelected && "border-slate-900 !border-1 bg-white"
            isFormElement && formElementClasses,
            isSection && isSectionClasses,
            isGhostElement && ghostElementClasses
          )}
        >
          {arrow}
          {isRenaming ? (
            <EditableInput title={title} context={context} />
          ) : (
            <div
              className={cn(
                "ml-12 flex items-center overflow-hidden relative",
                isSection && "w-[100%] h-[60px]",
                isFormElement && "rounded-md border-1 border-slate-500 p-3 w-5/6"
              )}
              {...(!isLocked && {
                onDoubleClick: () => {
                  context.startRenamingItem();
                },
              })}
            >
              <ItemActions context={context} arrow={arrow} handleDelete={handleDelete} />
              {title}
            </div>
          )}
        </div>
        {children}
      </>
    </li>
  );
};

const Title = ({ title }: { title: string }) => {
  return <div className="w-5/6 truncate">{title}</div>;
};

const Arrow = ({ item, context }: { item: TreeItem; context: TreeItemRenderContext }) => {
  return item.isFolder ? (
    <span {...context.arrowProps} className="absolute left-5 top-2 mr-2 mt-3 inline-block">
      {context.isExpanded ? <ArrowDown className="absolute top-1" /> : <ArrowRight />}
    </span>
  ) : null;
};

Item.Title = Title;
Item.Arrow = Arrow;
