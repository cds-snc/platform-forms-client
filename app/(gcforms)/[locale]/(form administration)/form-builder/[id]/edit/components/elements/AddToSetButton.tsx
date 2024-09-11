"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";

import { FormElementTypes } from "@lib/types";
import { Button } from "@clientComponents/globals";
import { ElementDialog } from "./element-dialog/ElementDialog";
import { ElementOptionsFilter } from "@lib/types/form-builder-types";
import { AddIcon } from "@serverComponents/icons/AddIcon";

export const AddToSetButton = ({
  filterElements,
  handleAdd,
}: {
  filterElements?: ElementOptionsFilter | undefined;
  handleAdd?: (type?: FormElementTypes) => void;
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
        onClick={handleOpenDialog}
        theme="link"
        className="group/button mb-2 !px-4 !py-2 text-sm leading-6"
        dataTestId="add-element"
      >
        <>
          <AddIcon className="mr-2 rounded-sm border-1 border-black group-focus/button:border-white group-focus/button:fill-white" />
          {t("addQuestionToSet")}
        </>
      </Button>
      {elementDialog && (
        <ElementDialog
          filterElements={filterElements}
          handleAddType={(type) => {
            handleAdd && handleAdd(type);
          }}
          handleClose={handleCloseDialog}
        />
      )}
    </>
  );
};
