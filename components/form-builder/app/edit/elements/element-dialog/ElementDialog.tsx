import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";

import { useDialogRef, Dialog, ListBox } from "../../../shared";
import { useElementOptions } from "../../../../hooks";
import { ElementDescription } from "./ElementDescription";

export const ElementDialog = ({
  handleAddType,
  handleClose,
}: {
  handleAddType?: (type?: FormElementTypes) => void;
  handleClose: () => void;
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
  const value = elementOptions[selected].value;
  const Description = elementOptions[selected].description;

  const handleAdd = useCallback(() => {
    handleAddType && handleAddType(id);
    handleClose();
  }, [handleClose, handleAddType, id]);

  return (
    <Dialog dialogRef={dialog} handleClose={handleClose}>
      <div className="flex">
        <div className="w-1/3 p-4 overflow-y-auto max-h-[600px]">
          <h4 className="mb-5">{t("addElementDialog.questionElement")}</h4>
          <ListBox
            ariaLabel={t("addElementDialog.questionElement")}
            options={elementOptions}
            handleChange={handleChange}
          />
        </div>
        <div className="border-l-1 border-black p-4 w-2/3 max-h-[600px]">
          <ElementDescription
            id={id}
            title={`${value} ${t("addElementDialog.example")}`}
            handleAdd={handleAdd}
          >
            <div className="mb-10 rounded border-1 border-gray-900 px-4 py-1 inline-block bg-gray-background">
              {t("addElementDialog.exampleElement")}
            </div>
            <Description
              title={t(`addElementDialog.${id}.title`)}
              description={t(`addElementDialog.${id}.description`)}
            />
          </ElementDescription>
        </div>
      </div>
    </Dialog>
  );
};
