import React from "react";
import { FormElementTypes } from "@lib/types";
import { useTranslation } from "next-i18next";

import { Button } from "../../../shared";

export const ElementDescription = ({
  id,
  title,
  children,
  handleAdd,
}: {
  id: FormElementTypes;
  title: string;
  children: React.ReactNode;
  handleAdd?: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  return (
    <div
      role="region"
      aria-label={title}
      id={id}
      className="ml-10 border-l-1 border-black grid grid-rows-w"
    >
      <div className="h-full flex select-none pointer-events-none">
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
