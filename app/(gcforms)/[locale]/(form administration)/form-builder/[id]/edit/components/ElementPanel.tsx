"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { PanelActions, PanelBodyRoot } from "./index";
import { useIsWithin } from "@lib/hooks/form-builder/useIsWithin";
import { useRefsContext } from "./RefsContext";
import { FormElementTypes, FormElement } from "@lib/types";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

import { cn } from "@lib/utils";
import { useHandleAdd } from "@lib/hooks/form-builder/useHandleAdd";
import { getTranslatedProperties } from "@formBuilder/actions";

import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";

export const ElementPanel = ({
  item,
  elements,
  formId,
}: {
  item: FormElementWithIndex;
  elements: FormElement[];
  formId: string;
}) => {
  const { getFocusInput, setChangeKey, setFocusInput, remove, moveUp, moveDown, duplicateElement } =
    useTemplateStore((s) => ({
      getFocusInput: s.getFocusInput,
      setChangeKey: s.setChangeKey,
      setFocusInput: s.setFocusInput,
      remove: s.remove,
      moveUp: s.moveUp,
      moveDown: s.moveDown,
      duplicateElement: s.duplicateElement,
    }));

  const [className, setClassName] = useState<string>("");
  const [ifFocus, setIfFocus] = useState<boolean>(false);
  const { treeView } = useTreeRef();
  const { handleAddElement } = useHandleAdd();
  const groupId = useGroupStore((state) => state.id);

  if (ifFocus === false) {
    // Only run this 1 time
    setIfFocus(true);

    // getFocusInput is only ever true if we press "duplicate" or "add question"
    if (getFocusInput()) {
      setClassName(
        "bg-yellow-100 transition-colors ease-out duration-[1500ms] delay-500 outline-[2px] outline-blue-focus outline"
      );
    }
  }

  useEffect(() => {
    // remove the yellow background immediately, CSS transition will fade the colour
    setClassName(className.replace("bg-yellow-100 ", ""));
    // remove the blue outline after 2.1 seconds
    setTimeout(() => setClassName(""), 2100);
  }, [className]);

  const { focusWithinProps, isWithin } = useIsWithin();
  const { refs } = useRefsContext();

  const forceRefresh = () => {
    setChangeKey(String(new Date().getTime())); //Force a re-render
  };

  const hasRules =
    (item.properties?.conditionalRules && item.properties?.conditionalRules?.length > 0) ?? false;

  const hasSubPanel = item.type === "dynamicRow";

  const handleDuplicateCallback = useCallback(async () => {
    setFocusInput(true);
    const { en, fr } = await getTranslatedProperties("copy");
    duplicateElement(item.id, groupId, en, fr);
  }, [duplicateElement, groupId, item.id, setFocusInput]);

  const isFileUpload = item.type === "fileInput";
  const { hasApiKeyId } = useFormBuilderConfig();

  return (
    <div
      id={`element-${item.id}`}
      {...focusWithinProps}
      className={cn(
        `element-${item.index}`,
        className,
        "group",
        isWithin && "active",
        "relative h-auto max-w-[800px] border-1 border-t-0 border-slate-500  bg-white",
        !hasSubPanel && isWithin && "focus-within:bg-violet-50 hover:bg-violet-50",
        hasRules && "border-dashed border-1 border-slate-500",
        hasSubPanel &&
          "border border-slate-500 hover:outline hover:outline-2 hover:outline-indigo-700 hover:outline-offset-[-1px] focus-within:outline focus-within:outline-2 focus-within:outline-indigo-700 focus-within:outline-offset-[-1px]",
        isFileUpload && !hasApiKeyId && "bg-red-50 hover:bg-red-50 focus-within:bg-red-50"
      )}
      onClick={(e) => {
        const el = e.target as HTMLElement;
        if (el.tagName === "DIV") {
          // Rich text editor
          if (item.type === "richText") {
            if (el.querySelector("[id^='editor-']")) {
              (el?.querySelector("[id^='editor-']") as HTMLElement).focus();
            } else if (el?.parentElement?.querySelector("[id^='editor-']")) {
              (el?.parentElement?.querySelector("[id^='editor-']") as HTMLElement).focus();
            }
            return;
          }

          // Non-repeating set panel
          if (!hasSubPanel) {
            refs?.current?.[item.id]?.focus();
          }

          // Repeating set panel
          if (hasSubPanel) {
            // find the closest data-id
            const closestDataId = el.closest("[data-id]");
            if (closestDataId) {
              refs?.current?.[Number(closestDataId?.getAttribute("data-id"))]?.focus();
            }
          }
        }
      }}
    >
      <PanelBodyRoot item={item} onChangeMade={forceRefresh} formId={formId} />
      <PanelActions
        item={item}
        isFirstItem={item.index === 0}
        isLastItem={item.index === elements.length - 1}
        totalItems={elements.length}
        handleAdd={(type?: FormElementTypes) => {
          handleAddElement(item.index, type);
        }}
        handleRemove={() => {
          const previousElement = elements[item.index - 1];
          treeView?.current && treeView?.current.removeItem(String(item.id));
          remove(item.id, groupId);

          setChangeKey(String(new Date().getTime()));

          // if index is 0, then highlight the form title
          if (item.index === 0) {
            document.getElementById("formTitle")?.focus();
            return;
          }

          // If the previous element is a rich text editor, then focus on the editor
          if (previousElement.type === "richText") {
            (
              document
                .getElementById(`element-${previousElement.id}`)
                ?.querySelector("[id^='editor-']") as HTMLElement
            ).focus();
            return;
          }

          // Otherwise focus on the previous question input
          refs && refs.current && refs.current[previousElement.id].focus();
        }}
        handleMoveUp={() => {
          moveUp(item.index, groupId);
          if (item.type === "richText") {
            (
              document
                .getElementById(`element-${item.id}`)
                ?.querySelector("[id^='editor-']") as HTMLElement
            ).focus();
            return;
          }

          refs && refs.current && refs.current[item.id].focus();
        }}
        handleMoveDown={() => {
          moveDown(item.index, groupId);
          if (item.type === "richText") {
            (
              document
                .getElementById(`element-${item.id}`)
                ?.querySelector("[id^='editor-']") as HTMLElement
            ).focus();
            return;
          }
          refs && refs.current && refs.current[item.id].focus();
        }}
        handleDuplicate={handleDuplicateCallback}
      />
    </div>
  );
};
