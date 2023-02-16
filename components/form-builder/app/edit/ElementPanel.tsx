import React, { useState, useEffect, useCallback } from "react";

import { FormElementWithIndex } from "../../types";
import { useTemplateStore } from "../../store";
import { PanelActions, PanelBodyRoot, MoreModal } from "./index";
import { isValidatedTextType } from "../../util";
import { FormElementTypes } from "@lib/types";

export const ElementPanel = ({ item }: { item: FormElementWithIndex }) => {
  const {
    lang,
    getFocusInput,
    setFocusInput,
    add,
    updateField,
    remove,
    moveUp,
    moveDown,
    duplicateElement,
    elements,
  } = useTemplateStore((s) => ({
    lang: s.lang,
    getFocusInput: s.getFocusInput,
    setFocusInput: s.setFocusInput,
    add: s.add,
    updateField: s.updateField,
    remove: s.remove,
    moveUp: s.moveUp,
    moveDown: s.moveDown,
    duplicateElement: s.duplicateElement,
    elements: s.form.elements,
  }));

  const [className, setClassName] = useState<string>("");
  const [ifFocus, setIfFocus] = useState<boolean>(false);

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

  /* Note this callback is also in PanelActions */
  const handleAddElement = useCallback(
    (index: number, type?: FormElementTypes) => {
      setFocusInput(true);
      add(index, isValidatedTextType(type) ? FormElementTypes.textField : type);
      if (isValidatedTextType(type)) {
        // add 1 to index because it's a new element
        updateField(`form.elements[${index + 1}].properties.validation.type`, type as string);
      }
    },
    [add, setFocusInput, updateField]
  );

  return (
    <div
      key={lang}
      className={`element-${item.index} ${className} group hover:bg-violet-100 focus:bg-violet-100 border border-t-0 border-black max-w-[800px] h-auto -mt-1 relative`}
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
