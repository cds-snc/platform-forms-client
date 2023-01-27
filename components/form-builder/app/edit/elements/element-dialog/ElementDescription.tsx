import React from "react";
import { FormElementTypes } from "@lib/types";
import { useTranslation } from "next-i18next";

import { Button } from "../../../shared";

export const ElementDescription = ({
  id,
  children,
  handleAdd,
}: {
  id: FormElementTypes;
  children: React.ReactNode;
  handleAdd?: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  return (
    <div id={id} className="ml-10 border-l-1 border-black grid grid-rows-w">
      <div className="h-full flex">
        <div className="mx-10 mb-10" data-testid="element-description-content">
          {children}
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
