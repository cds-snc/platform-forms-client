import { DragHandle } from "./icons/DragHandle";
import { LockIcon } from "@serverComponents/icons";
import { cn } from "@lib/utils";
import { ReactElement, ReactNode } from "react";
import { TreeItem, TreeItemIndex, TreeItemRenderContext } from "react-complex-tree";
import { ArrowRight } from "./icons/ArrowRight";
import { ArrowDown } from "./icons/ArrowDown";
import { useTreeRef } from "./provider/TreeRefProvider";
import { useState } from "react";
import React from "react";
import { LockedSections } from "./types";

export const Item = ({
  title,
  arrow,
  context,
  children,
}: {
  title: ReactNode;
  arrow: ReactNode;
  context: TreeItemRenderContext;
  children: ReactNode | ReactElement;
}) => {
  const { tree } = useTreeRef();
  const isRenaming = context && context?.isRenaming ? true : false;
  const [name, setName] = useState("");

  if (isRenaming) {
    return (
      <li
        {...context.itemContainerWithChildrenProps}
        className={cn(
          "flex flex-col",
          arrow && "border-b-1 border-slate-200 border-x-1 border-r-2 b-t-1",
          !context.isExpanded && "",
          children && "bg-slate-50"
        )}
        style={{
          margin: 0,
        }}
      >
        <div
          className={cn(
            "text-left group relative w-full overflow-hidden truncate p-3",
            !arrow && "bg-white",
            !arrow && "border-slate-500 border-1 rounded-md"
          )}
        >
          <input
            {...context.interactiveElementProps}
            type="text"
            autoFocus
            className="ml-10"
            value={name}
            onFocus={(e) => {
              e.target.select();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const props = context.interactiveElementProps as unknown as Record<string, unknown>;
                const id = props["data-rct-item-id"] as unknown as TreeItemIndex;
                tree?.current?.renameItem(id, name);
                context.stopRenamingItem();
              }
            }}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          {arrow}
        </div>
      </li>
    );
  }

  const titleString = (React.isValidElement(title) && title.props.title).toLowerCase();
  const isLocked = [LockedSections.START, LockedSections.END].includes(titleString);

  return (
    <li
      {...context.itemContainerWithChildrenProps}
      className={cn(
        "flex flex-col",
        arrow && "border-b-1 border-slate-200 border-x-1 border-r-2 b-t-1",
        !context.isExpanded && "",
        children && "bg-slate-50"
      )}
      style={{
        margin: 0,
      }}
    >
      <>
        <button
          {...context.itemContainerWithoutChildrenProps}
          {...context.interactiveElementProps}
          type="button"
          className={cn(
            "text-left group relative w-full overflow-hidden truncate p-3",
            !arrow && "bg-white",
            !arrow && "border-slate-500 border-1 rounded-md"
          )}
        >
          {arrow}

          <span
            className="ml-10"
            {...(!isLocked && {
              onDoubleClick: () => {
                tree?.current?.collapseAll();
                context.startRenamingItem();
              },
            })}
          >
            {title}
          </span>
          {context.canDrag ? (
            <DragHandle
              className={cn(
                "absolute right-0 top-0 mr-4 mt-3 hidden cursor-pointer group-hover:block",
                !arrow && "mt-2"
              )}
            />
          ) : (
            <LockIcon className="absolute right-0 mr-2 inline-block scale-75" />
          )}
        </button>
        {children}
      </>
    </li>
  );
};

const Title = ({ title }: { title: string }) => {
  return <span>{title}</span>;
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
