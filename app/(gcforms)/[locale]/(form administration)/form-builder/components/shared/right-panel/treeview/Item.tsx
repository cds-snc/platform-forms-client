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
import { useRefsContext } from "@formBuilder/[id]/edit/components/RefsContext";
import {
  getItemFromElement,
  isTitleElementType,
  isSectionElementType,
  isFormElementType,
  isGhostElementType,
  removeMarkdown,
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
  handleDelete?: (
    e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLLIElement>
  ) => Promise<void>;
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
  const isGhostElement = item ? isGhostElementType(item) : false;
  const isSectionElement = item ? isSectionElementType(item) : false;
  const isTitleElement = item ? isTitleElementType(item) : false;
  const fieldType = item ? item?.data.type : "";

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

  const sectionElementClasses = cn("w-[100%] h-[60px]", context.isFocused && "font-bold");

  const formElementClasses = cn(
    "rounded-md px-3 w-5/6 border-1 bg-white min-h-[50px]",
    context.isFocused && "border-indigo-700 border-2 font-bold bg-gray-50 text-indigo-700",
    context.isSelected && "border-2 border-slate-950 bg-white",
    !context.isSelected &&
      "border-slate-500 hover:border-indigo-700 hover:border-1 hover:bg-indigo-50"
  );

  return (
    <li
      {...context.itemContainerWithChildrenProps}
      className={cn(
        "flex flex-col group",
        (children as ReactElement) && context.isExpanded && "bg-slate-50",
        context.isDraggingOver && "!border-dashed !border-1 !border-blue-focus"
      )}
      onKeyDown={(e) => {
        if (isRenaming) {
          return;
        }

        if (e.key === "Delete" || e.key === "Backspace") {
          if (handleDelete) {
            e.preventDefault();
            handleDelete(e as React.KeyboardEvent<HTMLLIElement>);
          }
        }
      }}
    >
      <>
        <div
          {...context.itemContainerWithoutChildrenProps}
          {...context.interactiveElementProps}
          onDragStart={(e) => {
            context.interactiveElementProps.onDragStart &&
              context.interactiveElementProps.onDragStart(e);

            // Customize dragging image for form elements
            if (isFormElement && item.data.type !== "dynamicRow") {
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
            isGhostElement && interactiveGhostElementClasses,
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
                isFormElement && formElementClasses
              )}
              {...(isLocked && {
                onClick: () => {
                  if (
                    item.index === "intro" ||
                    item.index === "policy" ||
                    item.index === "end" ||
                    item.index === "confirmation"
                  ) {
                    let index = item.index;
                    if (index === "confirmation") {
                      index = "end";
                    }

                    // add small delay to allow the click to be registered
                    setTimeout(() => {
                      const el = document.getElementById(index);
                      if (el) {
                        (el as HTMLDetailsElement).open = true;
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }, 200);
                  }
                },
              })}
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
                  handleDelete={handleDelete}
                  lockClassName={cn(isFormElement && "absolute right-0", "mr-2 ")}
                />
              )}
              {titleText !== "" && title}
              {titleText === "" &&
                isFormElement &&
                fieldType === "richText" &&
                descriptionText !== "" && <Title fieldType={fieldType} title={descriptionText} />}
            </div>
          )}
        </div>
        {children}
      </>
    </li>
  );
};

const Title = ({ title, fieldType }: { title: string; fieldType?: string }) => {
  const { t } = useTranslation("form-builder");
  if (title === "Start") {
    title = t("logic.start");
  }

  if (title === "End") {
    title = t("logic.end");
  }

  if (fieldType && fieldType === "richText") {
    title = removeMarkdown(title);
  }

  return <div className={cn("w-5/6 truncate")}>{removeMarkdown(title)}</div>;
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
