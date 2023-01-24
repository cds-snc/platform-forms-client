import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";

import { useDialogRef, Dialog, ListBox } from "../../../shared";
import { useElementOptions } from "../../../../hooks";
import { useTemplateStore } from "../../../../store";
import { ElementDescription } from "./ElementDescription";

export const ElementDialog = ({
  handleClose,
  position,
}: {
  handleClose: () => void;
  position: number;
}) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();
  const { add, setFocusInput } = useTemplateStore((s) => ({
    add: s.add,
    setFocusInput: s.setFocusInput,
  }));

  const elementOptions = useElementOptions();

  const [selected, setSelected] = useState(0);

  const handleChange = useCallback(
    (val: number) => {
      setSelected(val);
    },
    [setSelected]
  );

  const id = elementOptions[selected].id as FormElementTypes;

  const handleAddElement = useCallback(() => {
    handleClose();
    add(position, elementOptions[selected].id as FormElementTypes);
    setFocusInput(true);
  }, [handleClose, add, position, elementOptions, selected, setFocusInput]);

  return (
    <Dialog dialogRef={dialog} handleClose={handleClose}>
      <div className="grid grid-cols-[30%_70%] w-full">
        <div>
          <h4 className="mb-5">{t("addElementDialog.questionElement")}</h4>
          <ListBox options={elementOptions} handleChange={handleChange} />
        </div>
        <ElementDescription id={id} handleAdd={handleAddElement} />
      </div>
    </Dialog>
  );
};
