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
    <div role="region" aria-label={title} id={id} className="h-full relative">
      <div data-testid="element-description-content">{children}</div>

      {handleAdd && (
        <div className="absolute right-0 bottom-0">
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
