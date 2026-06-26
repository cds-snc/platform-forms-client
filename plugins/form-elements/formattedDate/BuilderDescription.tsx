"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { Label } from "@clientComponents/forms";
import { ExampleWrapper } from "@root/plugins/shared";
import { FormattedDate as FormattedDateComponent } from "./FormattedDate";

const BuilderDescription = () => {
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
        <FormattedDateComponent name={"formattedDate"} />
      </ExampleWrapper>
    </>
  );
};

export default BuilderDescription;
