import React from "react";

import { cn } from "@lib/utils";
import { ReactElement, ReactNode } from "react";
import { TreeItem, TreeItemRenderContext } from "react-complex-tree";
import { ArrowRight } from "./icons/ArrowRight";
import { ArrowDown } from "./icons/ArrowDown";
import { EditableInput } from "./EditableInput";
import { ItemActions } from "./ItemActions";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";

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

  const { translationLanguagePriority, localizeField } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const localizedTitle = localizeField(
    LocalizedElementProperties.TITLE,
    translationLanguagePriority
  );

  // Pull item from arrow props
  let item: TreeItem;
  let titleText = "";
  if (arrow && typeof arrow === "object" && "props" in arrow) {
    item = arrow.props.item;
    titleText = isSection ? item?.data.name : item?.data[localizedTitle];
    isSection = item?.isFolder ? true : false;
    isFormElement = item?.isFolder ? false : true;
    isGhostElement = ["intro", "policy", "end"].includes(String(item?.index));
  }

  const isSectionClasses = cn(
    "w-full relative",
    !context.isExpanded && "border-b-1 border-slate-200"
  );
  const formElementClasses = cn("inline-block w-full relative h-[60px]");
  const ghostElementClasses = "inline-block w-full relative h-[60px]";

  return (
    <li
      {...context.itemContainerWithChildrenProps}
      className={cn(
        "flex flex-col group",
        children && context.isExpanded && "bg-slate-50",
        context.isDraggingOver && "!border-dashed !border-1 !border-blue-focus"
      )}
    >
      <>
        <div
          {...context.itemContainerWithoutChildrenProps}
          {...context.interactiveElementProps}
          className={cn(
            "text-left group relative w-full overflow-hidden truncate cursor-pointer h-[60px]",
            isFormElement && formElementClasses,
            isSection && isSectionClasses,
            isGhostElement && ghostElementClasses
          )}
        >
          {arrow}
          {isRenaming ? (
            <div className="relative flex h-[60px] w-[100%] items-center overflow-hidden text-sm">
              <EditableInput isSection={isSection} title={titleText} context={context} />
            </div>
          ) : (
            <div
              className={cn(
                "ml-12 flex items-center overflow-hidden relative text-sm",
                isSection && "w-[100%] h-[60px]",
                isFormElement && "rounded-md p-3 w-5/6 border-1 bg-white",
                isFormElement &&
                  !context.isSelected &&
                  " border-slate-500 hover:border-indigo-700 hover:border-1 hover:bg-indigo-50",
                isFormElement &&
                  context.isFocused &&
                  "border-indigo-700 border-1 bg-gray-50 text-indigo-700 ",
                isFormElement && context.isSelected && "border-2 border-slate-950  bg-white",
                isSection && context.isExpanded && "font-bold"
              )}
              {...(!isLocked && {
                onDoubleClick: () => {
                  context.startRenamingItem();
                },
              })}
            >
              <ItemActions
                context={context}
                arrow={arrow}
                handleDelete={handleDelete}
                lockClassName={cn(isFormElement && "absolute right-0", "mr-2 ")}
              />
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
