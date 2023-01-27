import React from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";

import { useDialogRef, Dialog } from "./shared";

export const ShareModal = ({
  handleClose,
}: {
  handleAddType?: (type?: FormElementTypes) => void;
  handleClose: () => void;
}) => {
  const { t } = useTranslation("form-builder");

  const dialog = useDialogRef();

  return (
    <div className="form-builder">
      <Dialog dialogRef={dialog} handleClose={handleClose}>
        <div className="p-4">{t("Modal body")}</div>
      </Dialog>
    </div>
  );
};
