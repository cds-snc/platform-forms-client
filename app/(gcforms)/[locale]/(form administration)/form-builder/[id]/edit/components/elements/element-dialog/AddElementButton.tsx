"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";

import { FormElementTypes } from "@lib/types";
import { Button } from "@clientComponents/globals";
import { ElementDialog } from "./ElementDialog";
import { ElementOptionsFilter } from "@lib/types/form-builder-types";
import { AddIcon } from "@serverComponents/icons";

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
        className="group/button !border-1.5 bg-violet-50 !px-4 !py-2 text-sm leading-6"
        dataTestId="add-element"
      >
        <>
          <AddIcon className="mr-2 rounded-full border-1 border-black fill-black group-hover/button:border-white group-hover/button:fill-white group-focus/button:border-white group-focus/button:fill-white" />
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
