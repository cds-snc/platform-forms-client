import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";

import { useDialogRef, Dialog, ListBox } from "../../../shared";
import { useElementOptions } from "../../../../hooks";
import { ElementDescription } from "./ElementDescription";

export const ElementDialog = ({
  handleAdd,
  handleClose,
  position,
}: {
  handleAdd?: (index: number, type?: FormElementTypes) => void;
  handleClose: () => void;
  position: number;
}) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();

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
    handleAdd && handleAdd(position, id);
  }, [handleClose, handleAdd, position, id]);

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
