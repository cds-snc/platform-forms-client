import React, { useCallback } from "react";

import { FormElementTypes } from "@lib/types";
import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { useTemplateStore } from "@components/form-builder/store";
import { blockLoader } from "../../blockLoader";
import { useUpdateElement } from "@components/form-builder/hooks";

export const PanelActionsLocked = ({ addElement }: { addElement: boolean }) => {
  const { add, setFocusInput } = useTemplateStore((s) => ({
    add: s.add,
    setFocusInput: s.setFocusInput,
  }));

  const { addElement: updateElement, isTextField } = useUpdateElement();

  /* Note this callback is also in ElementPanel */
  const handleAddElement = useCallback(
    (index: number, type?: FormElementTypes) => {
      if (type === FormElementTypes.attestation) {
        blockLoader(type, (data) => add(index, FormElementTypes.checkbox, data));
        return;
      }

      setFocusInput(true);
      add(index, isTextField(type as string) ? FormElementTypes.textField : type);
      // add 1 to index because it's a new element
      updateElement(type as string, `form.elements[${index + 1}]`);
    },
    [add, setFocusInput, updateElement, isTextField]
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
