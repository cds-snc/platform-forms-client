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
import { useTranslation } from "@i18n/client";
import {
  getItemFromElement,
  isTitleElementType,
  isSectionElementType,
  isFormElementType,
  isGhostElementType,
} from "./util/itemType";

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
  const { t } = useTranslation("form-builder");

  const { translationLanguagePriority, localizeField } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const localizedTitle = localizeField(
    LocalizedElementProperties.TITLE,
    translationLanguagePriority
  );

  const localizedDescription = localizeField(
    LocalizedElementProperties.DESCRIPTION,
    translationLanguagePriority
  );

  const item = getItemFromElement(arrow);

  // Types
  const isFormElement = item ? isFormElementType(item) : false;
  const isGhostElement = item ? isGhostElementType(item) : false;
  const isSectionElement = item ? isSectionElementType(item) : false;
  const isTitleElement = item ? isTitleElementType(item) : false;
  const fieldType = item ? item?.data.fieldType : "";

  // Text
  const titleText = item ? (isSectionElement ? item?.data.name : item?.data[localizedTitle]) : "";
  const descriptionText = isFormElement && item ? item?.data[localizedDescription] : "";

  // States
  const isRenaming = context && context?.isRenaming ? true : false;
  const isLocked = !context.canDrag;
  const allowRename = !isLocked || isTitleElement;

  const interactiveSectionElementClasses = cn(
    "w-full relative",
    !context.isExpanded && "border-b-1 border-slate-200"
  );
  const interactiveFormElementClasses = cn("inline-block w-full relative outline-none py-1.5");
  const interactiveGhostElementClasses = "inline-block w-full relative";
  const interactiveTitleElementClasses = cn("text-gray-500 italic");

  const sectionElementClasses = cn("w-[100%] h-[60px]", context.isExpanded && "font-bold");

  const formElementClasses = cn(
    "rounded-md px-3 w-5/6 border-1 bg-white min-h-[50px]",
    context.isSelected && "border-2 border-slate-950  bg-white",
    context.isFocused && "border-indigo-700 border-2 font-bold bg-gray-50 text-indigo-700",
    context.isSelected && "border-2 border-slate-950  bg-white",
    !context.isSelected &&
      "border-slate-500 hover:border-indigo-700 hover:border-1 hover:bg-indigo-50"
  );

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
            isSectionElement && interactiveSectionElementClasses,
            isFormElement && interactiveFormElementClasses,
            isGhostElement && interactiveGhostElementClasses,
            isTitleElement && interactiveTitleElementClasses
          )}
        >
          {arrow}
          {isRenaming ? (
            <div className="relative flex h-[60px] w-[100%] items-center overflow-hidden text-sm">
              <EditableInput isSection={isSectionElement} title={titleText} context={context} />
            </div>
          ) : (
            <div
              className={cn(
                "ml-12 flex items-center overflow-hidden relative text-sm",
                isSectionElement && sectionElementClasses,
                isFormElement && formElementClasses
              )}
              {...(allowRename && {
                onDoubleClick: () => {
                  context.startRenamingItem();
                },
              })}
            >
              {/* Render placeholder if title is empty */}

              {isFormElement && fieldType === "richText" && descriptionText === "" && (
                <span className="text-gray-500">{t("groups.treeView.emptyPageTextElement")}</span>
              )}
              {isFormElement && fieldType !== "richText" && titleText === "" && (
                <span className="text-gray-500">{t("groups.treeView.emptyFormElement")}</span>
              )}

              {isSectionElement && titleText === "" && (
                <span className="text-gray-500">{t("groups.newSection")}</span>
              )}
              {/* End placeholders */}

              {titleText !== "" && (
                <ItemActions
                  context={context}
                  arrow={arrow}
                  handleDelete={handleDelete}
                  lockClassName={cn(isFormElement && "absolute right-0", "mr-2 ")}
                />
              )}
              {titleText !== "" && title && title}
              {titleText === "" &&
                isFormElement &&
                fieldType === "richText" &&
                descriptionText !== "" && <Title title={descriptionText} />}
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
