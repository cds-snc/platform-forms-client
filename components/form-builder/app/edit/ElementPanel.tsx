import React, { useState, useEffect } from "react";

import { FormElementWithIndex } from "../../types";
import { useTemplateStore } from "../../store";
import { PanelActions, PanelBodyRoot, MoreModal } from "./index";
import { useIsWithin, useHandleAdd } from "@components/form-builder/hooks";

export const ElementPanel = ({ item }: { item: FormElementWithIndex }) => {
  const {
    lang,
    getFocusInput,
    setFocusInput,
    remove,
    moveUp,
    moveDown,
    duplicateElement,
    elements,
  } = useTemplateStore((s) => ({
    lang: s.lang,
    getFocusInput: s.getFocusInput,
    setFocusInput: s.setFocusInput,
    remove: s.remove,
    moveUp: s.moveUp,
    moveDown: s.moveDown,
    duplicateElement: s.duplicateElement,
    elements: s.form.elements,
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

  return (
    <div
      {...focusWithinProps}
      className={`element-${item.index} ${className} group ${
        isWithin ? "active" : ""
      } hover:bg-violet-50 focus:bg-violet-50 border border-t-0 border-black max-w-[800px] h-auto relative`}
    >
      <PanelBodyRoot item={item} />
      <PanelActions
        subIndex={-1}
        elements={elements}
        lang={lang}
        item={item}
        handleAdd={handleAddElement}
        handleRemove={() => {
          // if index is 0, then highlight the form title
          const labelId = item.index === 0 ? "formTitle" : `item${item.index - 1}`;
          remove(item.id);
          document.getElementById(labelId)?.focus();
        }}
        handleMoveUp={() => {
          moveUp(item.index);
        }}
        handleMoveDown={() => {
          moveDown(item.index);
        }}
        handleDuplicate={() => {
          setFocusInput(true);
          duplicateElement(item.index);
        }}
        renderMoreButton={({ item, moreButton }) => (
          <MoreModal item={item} moreButton={moreButton} />
        )}
      />
    </div>
  );
};
