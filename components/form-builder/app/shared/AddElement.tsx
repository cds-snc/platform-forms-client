import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";

import { Button } from "./Button";
import { useTemplateStore } from "../../store";
import { useDialogRef, Dialog, ListBox } from "../shared";
import { useElementOptions } from "../../hooks";

const ElementDialog = ({
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

  return (
    <Dialog dialogRef={dialog} handleClose={handleClose}>
      <div className="p-5 grid grid-cols-[30%_70%] w-full">
        <div>
          <h4 className="mb-5">{t("addElementDialog.questionElement")}</h4>
          <ListBox options={elementOptions} handleChange={handleChange} />
        </div>
        <div className="ml-10 border-l-1 border-black grid grid-rows-w">
          <div className="h-full flex content-center items-center justify-center">
            <div>
              <h3>{t(`addElementDialog.${id}.title`)}</h3>
              <p>{t(`addElementDialog.${id}.description`)}</p>
            </div>
          </div>
          <div className="self-end justify-self-end">
            <Button
              onClick={() => {
                handleClose();
                add(position, elementOptions[selected].id as FormElementTypes);
                setFocusInput(true);
              }}
            >
              {t("addElementDialog.addButton")}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export const AddElement = ({
  onClick,
  position,
}: {
  onClick?: any; // eslint-disable-line  @typescript-eslint/no-explicit-any
  position: number;
}) => {
  const { t } = useTranslation("form-builder");
  const [elementDialog, showElementDialog] = useState(false);
  const handleOpenDialog = useCallback(() => {
    showElementDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    showElementDialog(false);
  }, []);

  return (
    <>
      <Button
        onClick={() => {
          handleOpenDialog();
          onClick && onClick();
        }}
        theme="secondary"
        className="!border-1.5 !py-2 !px-4 leading-6 text-sm"
        dataTestId="add-element"
      >
        {t("addElement")}
      </Button>
      {elementDialog && <ElementDialog position={position} handleClose={handleCloseDialog} />}
    </>
  );
};
