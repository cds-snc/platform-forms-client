"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";

import { FormElementTypes } from "@lib/types";
import { Button } from "@clientComponents/globals";
import { ElementDialog } from "./ElementDialog";
import { ElementOptionsFilter } from "@lib/types/form-builder-types";
import { LargeAddIcon } from "@serverComponents/icons/LargeAddIcon";

export const AddElementButton = ({
  filterElements,
  handleAdd,
  theme = "secondary",
  text,
}: {
  filterElements?: ElementOptionsFilter | undefined;
  handleAdd?: (type?: FormElementTypes) => void;
  theme?: "secondary" | "link";
  text?: string;
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
        theme={theme}
        className="group/button mb-2 !border-1.5 border-slate-500 bg-gray-soft !px-4 !py-2 text-sm leading-6 text-indigo-700 hover:bg-gray-200 hover:text-indigo-800"
        dataTestId="add-element"
      >
        <>
          <LargeAddIcon className="mr-2 fill-indigo-500  hover:stroke-slate-200 group-hover/button:fill-indigo-600 group-focus/button:fill-white" />
          {text ? text : t("addElement")}
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
