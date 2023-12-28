import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { FormElementTypes } from "@lib/types";

import { useDialogRef, Dialog, ListBox } from "../../../shared";
import { useElementOptions } from "../../../../hooks";
import { ElementOptionsFilter } from "../../../../types";
import { ElementDescription } from "./ElementDescription";

export const ElementDialog = ({
  handleAddType,
  handleClose,
  filterElements,
}: {
  handleAddType?: (type?: FormElementTypes) => void;
  handleClose: () => void;
  filterElements?: ElementOptionsFilter;
}) => {
  const { t } = useTranslation("form-builder");

  const dialog = useDialogRef();

  const elementOptions = useElementOptions(filterElements);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.stopPropagation();
        handleAdd();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleAdd]);

  return (
    <Dialog dialogRef={dialog} handleClose={handleClose}>
      <div className="flex">
        <div className="max-h-[620px] w-1/3 overflow-y-auto bg-slate-50 py-4 pr-2">
          <h4 className="mb-5 pl-4 text-2xl font-bold">{t("addElementDialog.questionElement")}</h4>
          <ListBox
            ariaLabel={t("addElementDialog.questionElement")}
            options={elementOptions.map(({ id, value, group, className, icon }) => ({
              id: id as string,
              value,
              group,
              className,
              icon,
            }))}
            handleChange={handleChange}
          />
        </div>
        <div className="max-h-[620px] w-2/3 border-l-1 border-slate-500 p-4">
          <ElementDescription
            id={id}
            title={`${value} ${t("addElementDialog.example")}`}
            handleAdd={handleAdd}
          >
            <div className="-mt-2 mb-5 inline-block rounded border-1 border-gray-900 bg-gray-background px-4 py-1">
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
