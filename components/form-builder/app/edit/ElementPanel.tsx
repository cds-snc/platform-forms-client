import React, { useState, useEffect } from "react";

import { FormElementWithIndex } from "../../types";
import { useTemplateStore } from "../../store";
import { PanelActions, PanelBodyRoot, MoreModal } from "./index";

import { useIsWithin, useHandleAdd } from "@components/form-builder/hooks";
import { useRefsContext } from "./RefsContext";
import { FormElementTypes, FormElement } from "@lib/types";

export const ElementPanel = ({
  item,
  elements,
}: {
  item: FormElementWithIndex;
  elements: FormElement[];
}) => {
  const { getFocusInput, setFocusInput, remove, moveUp, moveDown, duplicateElement } =
    useTemplateStore((s) => ({
      getFocusInput: s.getFocusInput,
      setFocusInput: s.setFocusInput,
      remove: s.remove,
      moveUp: s.moveUp,
      moveDown: s.moveDown,
      duplicateElement: s.duplicateElement,
    }));

  const [className, setClassName] = useState<string>("");
  const [ifFocus, setIfFocus] = useState<boolean>(false);
  const { handleAddElement } = useHandleAdd();

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

  const moreButton =
    item.type !== "richText"
      ? {
          moreButtonRenderer: (
            moreButton: JSX.Element | undefined
          ): React.ReactElement | string | undefined => (
            <MoreModal item={item} moreButton={moreButton} />
          ),
        }
      : {};

  /* eslint-disable jsx-a11y/no-static-element-interactions */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  return (
    <div
      id={`element-${item.id}`}
      {...focusWithinProps}
      className={`element-${item.index} ${className} group ${
        isWithin ? "active" : ""
      } hover:bg-violet-50 focus-within:bg-violet-50 border border-t-0 border-black max-w-[800px] h-auto relative`}
      onClick={(e) => {
        const el = e.target as HTMLElement;
        if (el.tagName === "DIV") {
          if (item.type === "richText") {
            if (el.querySelector("[id^='editor-']")) {
              (el?.querySelector("[id^='editor-']") as HTMLElement).focus();
            } else if (el?.parentElement?.querySelector("[id^='editor-']")) {
              (el?.parentElement?.querySelector("[id^='editor-']") as HTMLElement).focus();
            }
            return;
          }

          refs?.current?.[item.id]?.focus();
        }
      }}
    >
      <PanelBodyRoot item={item} />
      <PanelActions
        isFirstItem={item.index === 0}
        isLastItem={item.index === elements.length - 1}
        totalItems={elements.length}
        handleAdd={(type?: FormElementTypes) => {
          handleAddElement(item.index, type);
        }}
        handleRemove={() => {
          const previousElement = elements[item.index - 1];
          remove(item.id);

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
          moveUp(item.index);
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
          moveDown(item.index);
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
        handleDuplicate={() => {
          setFocusInput(true);
          duplicateElement(item.id);
        }}
        {...moreButton}
      />
    </div>
  );
};
