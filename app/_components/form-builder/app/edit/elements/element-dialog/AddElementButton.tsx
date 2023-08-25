import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";

import { FormElementTypes } from "@lib/types";
import { Button } from "@appComponents/globals";
import { ElementDialog } from "./ElementDialog";
import { ElementOptionsFilter } from "../../../../types";
import { AddIcon } from "@appComponents/form-builder/icons";

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
        className="!border-1.5 !py-2 !px-4 leading-6 text-sm bg-violet-50 group/button"
        dataTestId="add-element"
      >
        <>
          <AddIcon className="rounded-full border-1 border-black group-focus/button:border-white group-hover/button:border-white fill-black group-hover/button:fill-white group-focus/button:fill-white mr-2" />
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
