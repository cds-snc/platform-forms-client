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
    <div className="flex last-of-type:rounded-b-md">
      <div className="mx-auto bottom-0 -mb-5 xl:mr-2 z-10">
        <AddElementButton position={-1} handleAdd={handleAddElement} />
      </div>
    </div>
  );
};
