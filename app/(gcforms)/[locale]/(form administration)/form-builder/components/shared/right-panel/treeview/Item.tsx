import { DragHandle } from "./icons/DragHandle";
import { LockIcon } from "@serverComponents/icons";
import { cn } from "@lib/utils";
import { ReactElement, ReactNode } from "react";
import { TreeItem, TreeItemRenderContext } from "react-complex-tree";
import { ArrowRight } from "./icons/ArrowRight";
import { ArrowDown } from "./icons/ArrowDown";

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
  return (
    <li
      {...context.itemContainerWithChildrenProps}
      className={cn(
        "flex flex-col p-2",
        arrow && "border-b-1 border-slate-00 border-x-1 border-r-2 b-t-1",
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
            "text-left group relative w-full overflow-hidden truncate p-1",
            !arrow && "bg-white",
            !arrow && "border-slate-500 border-1 rounded-md"
          )}
        >
          {arrow}
          <span className="ml-10">{title}</span>
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
    <span {...context.arrowProps} className="absolute left-5 top-2 mr-2 inline-block">
      {context.isExpanded ? <ArrowDown className="absolute top-1" /> : <ArrowRight />}
    </span>
  ) : null;
};

Item.Title = Title;
Item.Arrow = Arrow;
