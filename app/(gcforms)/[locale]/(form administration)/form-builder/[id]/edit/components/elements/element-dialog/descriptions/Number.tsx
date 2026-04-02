"use client";
import React from "react";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Label, NumberInput } from "@clientComponents/forms";
import { useTranslation } from "@i18n/client";

export const Number = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <h3 data-testid="element-description-title" className="mb-0">
        {t("addElementDialog.number.title")}
      </h3>
      <p data-testid="element-description-text">{t("addElementDialog.number.description")}</p>

      <ExampleWrapper className="gcds-input-wrapper">
        <Label htmlFor="name" className="gcds-label">
          {t("addElementDialog.number.amount")}
        </Label>
        <Description>{t("addElementDialog.number.enterOnlyNumbers")}</Description>
        <NumberInput label="title" name="name" placeholder="123456789" />
      </ExampleWrapper>
    </div>
  );
};
