import React from "react";

import { cn } from "@lib/utils";
import { ReactElement, ReactNode } from "react";
import { TreeItem, TreeItemRenderContext } from "react-complex-tree";
import { Hamburger } from "./icons/Hamburger";
import { EditableInput } from "./EditableInput";
import { ItemActions } from "./ItemActions";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";
import { useTranslation } from "@i18n/client";
import { useRefsContext } from "@formBuilder/[id]/edit/components/RefsContext";
import {
  getItemFromElement,
  isTitleElementType,
  isSectionElementType,
  isFormElementType,
} from "./util/itemType";

export const SubItem = ({
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
  const { t } = useTranslation("form-builder");
  const { refs } = useRefsContext();

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
  const isSectionElement = item ? isSectionElementType(item) : false;
  const isTitleElement = item ? isTitleElementType(item) : false;
  const fieldType = item ? item?.data.type : "";

  const isSubElement = item?.data.isSubElement;

  // Text
  const titleText = item ? (isSectionElement ? item?.data.name : item?.data[localizedTitle]) : "";
  const descriptionText = isFormElement && item ? item?.data[localizedDescription] : "";

  // States
  const isRenaming = context && context?.isRenaming ? true : false;
  const isLocked = !context.canDrag;
  const allowRename = !isLocked || isTitleElement || isSubElement;

  const interactiveSectionElementClasses = cn(
    "w-full relative",
    !context.isExpanded && "border-b-1 border-slate-200"
  );
  const interactiveFormElementClasses = cn("inline-block w-full relative outline-none");
  const interactiveTitleElementClasses = cn("text-gray-500 italic");

  const sectionElementClasses = cn("w-[100%] h-[60px]", context.isExpanded && "font-bold");

  const formSubElementClasses = cn(
    "px-3 w-5/6 border-l-2 border-indigo-700 bg-none min-h-[60px] cursor-default py-0",
    context.isFocused && "",
    context.isSelected && "",
    !context.isSelected && ""
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
          onDragStart={(e) => {
            context.interactiveElementProps.onDragStart &&
              context.interactiveElementProps.onDragStart(e);

            // Customize dragging image for form elements
            if (isFormElement) {
              // Get the box inside the element being dragged
              const el = e.currentTarget.children[0];

              // Get the position of the cursor inside the box for the offset
              const rect = el.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;

              // Use the inner box for the drag image
              e.dataTransfer.setDragImage(el, x, y);
            }
          }}
          className={cn(
            "text-left group relative w-full overflow-hidden truncate cursor-pointer h-[60px]",
            isSectionElement && interactiveSectionElementClasses,
            isFormElement && interactiveFormElementClasses,
            isTitleElement && interactiveTitleElementClasses
          )}
        >
          {arrow}
          {isRenaming ? (
            <div className="relative flex h-[60px] w-full items-center overflow-hidden text-sm">
              <EditableInput isSection={isSectionElement} title={titleText} context={context} />
            </div>
          ) : (
            <div
              className={cn(
                "ml-12 flex items-center overflow-hidden relative text-sm",
                isSectionElement && sectionElementClasses,
                isFormElement && formSubElementClasses
              )}
              {...(allowRename && {
                onDoubleClick: () => {
                  context.startRenamingItem();
                },
                onClick: () => {
                  if (refs && refs.current) {
                    const el = refs?.current?.[item.index];
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }
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
                  lockClassName={cn(isFormElement && "absolute right-0", "mr-2 ")}
                />
              )}
              {titleText !== "" && title && (
                <Title title={titleText} isSubElement={isSubElement} context={context} />
              )}
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

const Title = ({
  title,
  isSubElement,
  context,
}: {
  title: string;
  isSubElement?: boolean;
  context?: TreeItemRenderContext;
}) => {
  const { t } = useTranslation("form-builder");
  if (title === "Start") {
    title = t("logic.start");
  }

  if (title === "End") {
    title = t("logic.end");
  }

  return (
    <div
      className={cn(
        "w-5/6 truncate",
        isSubElement && "ml-4 bg-white border-1 border-slate-500 py-3 px-3 rounded-md w-full",
        context &&
          context.isFocused &&
          "border-indigo-700 border-2 font-bold bg-gray-50 text-indigo-700",
        context && context.isSelected && "border-2 border-slate-950 bg-white",
        context &&
          !context.isSelected &&
          "border-slate-500 hover:border-indigo-700 hover:border-1 hover:bg-indigo-50"
      )}
    >
      {title}
    </div>
  );
};

const Arrow = ({ item, context }: { item: TreeItem; context: TreeItemRenderContext }) => {
  return item.isFolder ? (
    <span {...context.arrowProps} className="absolute left-5 top-3 mr-2 mt-3 inline-block">
      <Hamburger />
    </span>
  ) : null;
};

SubItem.Title = Title;
SubItem.Arrow = Arrow;
