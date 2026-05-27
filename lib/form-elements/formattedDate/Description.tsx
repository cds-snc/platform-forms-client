"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { FormattedDate as FormattedDateComponent, Label } from "@clientComponents/forms";
import { ExampleWrapper } from "@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/ExampleWrapper";

export const FormattedDateDescription = () => {
  const { t } = useTranslation("form-builder");

  return (
    <>
      <h3 data-testid="element-description-title" className="mb-0">
        {t("addElementDialog.formattedDate.title")}
      </h3>
      <p data-testid="element-description-text">
        {t("addElementDialog.formattedDate.description")}
      </p>

      <ExampleWrapper>
        <Label htmlFor="formattedDate">{t("addElementDialog.formattedDate.label")}</Label>
        <FormattedDateComponent name="formattedDate" />
      </ExampleWrapper>
    </>
  );
};
