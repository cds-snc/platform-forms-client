import React from "react";
import { useTranslation } from "react-i18next";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Label, TextInput } from "@components/forms";
export const Date = () => {
  const { t } = useTranslation("form-builder");
  const dateExample = t("addElementDialog.date.example.dateValue");
  return (
    <div>
      <h3 className="mb-0">{t("addElementDialog.date.title")}</h3>
      <p>{t("addElementDialog.date.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="name" className="gc-label">
          Enter a specific answer
        </Label>
        <Description>Enter a date. For example: mm/dd/yyyy</Description>
        <TextInput label="title" type={"text"} name={"name"} placeholder={dateExample} />
      </ExampleWrapper>
    </div>
  );
};
