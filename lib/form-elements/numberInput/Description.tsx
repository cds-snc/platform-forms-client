"use client";
import React from "react";
import { Description, Label, NumberInput } from "@clientComponents/forms";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/ExampleWrapper";

export const NumberInputDescription = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <h3 data-testid="element-description-title" className="mb-0">
        {t("addElementDialog.number.title")}
      </h3>
      <p data-testid="element-description-text">{t("addElementDialog.number.description")}</p>

      <ExampleWrapper className="gcds-input-wrapper">
        <Label htmlFor="numberInputPreview" className="gcds-label">
          {t("addElementDialog.number.amount")}
        </Label>
        <Description>{t("addElementDialog.number.enterOnlyNumbers")}</Description>
        <NumberInput
          label="title"
          id="numberInputPreview"
          name="numberInputPreview"
          placeholder="123456789"
        />
      </ExampleWrapper>
    </div>
  );
};
