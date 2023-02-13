import React from "react";
import { useTranslation } from "react-i18next";

import { FormElementTypes } from "@lib/types";
import { AddElementButton } from "../element-dialog/AddElementButton";
import { DynamicRowModal } from "./DynamicRowModal";
import { Button } from "../../../shared/Button";
import { ElementOptionsFilter, FormElementWithIndex } from "../../../../types";

export const Menu = ({
  item,
  elIndex,
  subIndex,
  handleAdd,
  handleRemove,
  filterElements,
}: {
  item: FormElementWithIndex;
  elIndex: number;
  subIndex: number;
  handleAdd: (subIndex: number, type?: FormElementTypes) => void;
  handleRemove: (elIndex: number, subIndex: number) => void;
  filterElements: ElementOptionsFilter;
}) => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="mt-5 flex justify-end relative pb-2">
      <AddElementButton
        text={t("addToSet")}
        position={subIndex}
        handleAdd={handleAdd}
        filterElements={filterElements}
      />

      {/*
          Note: we use the item.id as the index here 
          to avoid conflicts with the index of the parent element
         */}
      <DynamicRowModal elIndex={elIndex} subIndex={subIndex} item={{ ...item, index: item.id }} />

      <Button
        theme="secondary"
        className="btn btn-danger inline-block ml-5 !border-1.5 !py-2 !px-4 leading-6 text-sm"
        onClick={() => handleRemove(elIndex, item.id)}
      >
        {t("removeFromSet")}
      </Button>
    </div>
  );
};
