import React from "react";
import { FormElementTypes } from "@lib/types";
import { useTranslation } from "next-i18next";

import { Button } from "../../../shared";

export const ElementDescription = ({
  id,
  handleAdd,
}: {
  id: FormElementTypes;
  handleAdd?: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="ml-10 border-l-1 border-black grid grid-rows-w">
      <div className="h-full flex content-center items-center justify-center">
        <div data-testid="element-description-content">
          <h3>{t(`addElementDialog.${id}.title`)}</h3>
          <p>{t(`addElementDialog.${id}.description`)}</p>
        </div>
      </div>
      {handleAdd && (
        <div className="self-end justify-self-end">
          <Button
            dataTestId="element-description-add-element"
            onClick={handleAdd}
            className="btn btn-primary"
          >
            {t("addElementDialog.addButton")}
          </Button>
        </div>
      )}
    </div>
  );
};
