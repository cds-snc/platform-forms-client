"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import {
  FormattedDate as FormattedDateComponent,
  Description,
  Label,
} from "@clientComponents/forms";
import { DatePart } from "@clientComponents/forms/FormattedDate/FormattedDate";

export const FormattedDate = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.formattedDate.title")}</h3>
      <p>{t("addElementDialog.formattedDate.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="formattedDate">{t("addElementDialog.formattedDate.label")}</Label>
        <Description>{t("addElementDialog.formattedDate.description")}</Description>
        <FormattedDateComponent
          dateParts={[DatePart.YYYY, DatePart.MM, DatePart.DD]}
          monthSelector={"select"}
          defaultDate={""}
          autocomplete={false}
          name={"formattedDate"}
        />
      </ExampleWrapper>
    </>
  );
};
