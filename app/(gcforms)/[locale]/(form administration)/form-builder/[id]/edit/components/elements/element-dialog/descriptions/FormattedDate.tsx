"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { FormattedDate as FormattedDateComponent, Label } from "@clientComponents/forms";

export const FormattedDate = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h3 data-testid="element-description-title" className="mb-0">
        {t("addElementDialog.formattedDate.title")}
      </h3>
      <p data-testid="element-description-text">
        {t("addElementDialog.formattedDate.description")}
      </p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="formattedDate">{t("addElementDialog.formattedDate.label")}</Label>
        <FormattedDateComponent name={"formattedDate"} />
      </ExampleWrapper>
    </>
  );
};
