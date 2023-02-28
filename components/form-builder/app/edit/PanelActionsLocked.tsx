import React, { useCallback } from "react";

import { FormElementTypes } from "@lib/types";
import { isValidatedTextType } from "../../util";
import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { useTemplateStore } from "@components/form-builder/store";
import { blockLoader } from "../../blockLoader";
import { useUpdateElement } from "@components/form-builder/hooks";

export const PanelActionsLocked = ({ addElement }: { addElement: boolean }) => {
  const { add, setFocusInput, updateField } = useTemplateStore((s) => ({
    add: s.add,
    updateField: s.updateField,
    setFocusInput: s.setFocusInput,
  }));

  const { setDefaultDescription } = useUpdateElement();

  /* Note this callback is also in PanelActions */
  const handleAddElement = useCallback(
    (index: number, type?: FormElementTypes) => {
      if (type === FormElementTypes.attestation) {
        blockLoader(type, (data) => add(index, FormElementTypes.checkbox, data));
        return;
      }

      setFocusInput(true);
      add(index, isValidatedTextType(type) ? FormElementTypes.textField : type);
      if (isValidatedTextType(type)) {
        // add 1 to index because it's a new element
        const path = `form.elements[${index + 1}]`;
        updateField(`${path}.properties.validation.type`, type as string);
        setDefaultDescription(type as FormElementTypes, path);
      }
    },
    [add, setFocusInput, updateField, setDefaultDescription]
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
