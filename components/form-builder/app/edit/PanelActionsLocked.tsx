import React, { useCallback } from "react";

import { FormElementTypes } from "@lib/types";
import { isValidatedTextType } from "../../util";
import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { useTemplateStore } from "@components/form-builder/store";

export const PanelActionsLocked = ({ addElement }: { addElement: boolean }) => {
  const { add, setFocusInput, updateField } = useTemplateStore((s) => ({
    add: s.add,
    updateField: s.updateField,
    setFocusInput: s.setFocusInput,
  }));

  /* Note this callback is also in PanelActionsLocked */
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

  if (!addElement) return null;

  return (
    <div className="z-index-[999] pl-8 pt-2 pb-2 relative flex items-center h-[62px] last-of-type:rounded-b-md">
      <div className="absolute top-[35px] right-[30px]">
        <AddElementButton position={-1} handleAdd={handleAddElement} />
      </div>
    </div>
  );
};
