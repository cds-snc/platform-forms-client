import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";
import { useFlag } from "@lib/hooks";

import { FormElementTypes } from "@lib/types";
import { Button } from "../../../shared/Button";
import { ElementDialog } from "./ElementDialog";
import { ElementOptionsFilter } from "../../../../types";
import { AddIcon } from "@components/form-builder/icons";

export const AddElementButton = ({
  filterElements,
  handleAdd,
  position, // the postion where we want to insert the new element
  text,
}: {
  filterElements?: ElementOptionsFilter | undefined;
  handleAdd?: (index: number, type?: FormElementTypes) => void;
  position: number;
  text?: string;
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
          !dialogEnabled && handleAdd && handleAdd(position);
        }}
        theme="secondary"
        className="!border-1.5 !py-2 !px-4 leading-6 text-sm bg-gray-200"
        dataTestId="add-element"
      >
        <>
          <AddIcon className="rounded-full border-1 border-black mr-2" />
          {text ? text : t("addElement")}
        </>
      </Button>
      {elementDialog && (
        <ElementDialog
          filterElements={filterElements}
          handleAddType={(type) => {
            handleAdd && handleAdd(position, type);
          }}
          handleClose={handleCloseDialog}
        />
      )}
    </>
  );
};
