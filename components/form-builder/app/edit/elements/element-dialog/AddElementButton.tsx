import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";
import { useFlag } from "@lib/hooks";

import { Button } from "../../../shared/Button";
import { ElementDialog } from "./ElementDialog";

export const AddElementButton = ({
  onClick, // onClick will be removed when we remove dialog flag
  position, // the postion where we want to insert the new element
}: {
  onClick?: () => void;
  position: number;
}) => {
  const { status: dialogEnabled } = useFlag("formBuilderAddElementDialog");

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
          dialogEnabled && handleOpenDialog();
          !dialogEnabled && onClick && onClick();
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
