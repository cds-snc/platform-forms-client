"use client";
import React from "react";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Label, TextInput } from "@clientComponents/forms";
import { useTranslation } from "@i18n/client";

export const Number = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <h3 className="mb-0">{t("addElementDialog.number.title")}</h3>
      <p>{t("addElementDialog.number.description")}</p>

      <ExampleWrapper className="gcds-input-wrapper mt-4">
        <Label htmlFor="name" className="gc-label">
          {t("addElementDialog.number.amount")}
        </Label>
        <Description>{t("addElementDialog.number.enterOnlyNumbers")}</Description>
        <TextInput label="title" type="number" name="name" placeholder="123456789" />
      </ExampleWrapper>
    </div>
  );
};
