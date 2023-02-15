import React, { useCallback } from "react";
import { useTranslation } from "next-i18next";

import { FormElementTypes } from "@lib/types";
import { LockIcon } from "../../icons";
import { isValidatedTextType } from "../../util";
import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { useTemplateStore } from "@components/form-builder/store";

export const PanelActionsLocked = ({ addElement }: { addElement: boolean }) => {
  const { t } = useTranslation("form-builder");

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

  return (
    <div className="relative z-10 pb-2 bg-gray-200 h-[62px] last-of-type:rounded-b-md">
      <div className="absolute left-0 ml-8 text-sm line-height-[60px]" data-testid="locked-item">
        <div className="flex py-4">
          <LockIcon className="mr-2" /> <span className="py-1">{t("lockedElement")}</span>
        </div>
      </div>
      {addElement && (
        <div className="flex">
          <div className="z-10 mt-10 mx-auto">
            <AddElementButton position={-1} handleAdd={handleAddElement} />
          </div>
        </div>
      )}
    </div>
  );
};
