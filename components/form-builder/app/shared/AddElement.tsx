import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";

import { Button } from "./Button";
import { useTemplateStore } from "../../store";
import { useDialogRef, Dialog } from "../shared";

const ElementDialog = ({
  handleClose,
  position,
}: {
  handleClose: () => void;
  position: number;
}) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();
  const { add } = useTemplateStore((s) => ({
    add: s.add,
  }));

  return (
    <Dialog
      actions={
        <Button
          onClick={() => {
            handleClose();
            add(position, FormElementTypes.dropdown);
          }}
        >
          {t("addElementDialog.addButton")}
        </Button>
      }
      dialogRef={dialog}
      handleClose={handleClose}
    >
      <div className="p-5">Hello</div>
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
