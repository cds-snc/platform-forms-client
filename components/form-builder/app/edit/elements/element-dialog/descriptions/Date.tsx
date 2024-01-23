import React from "react";
import { useTranslation } from "react-i18next";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Label, TextInput } from "@components/forms";
export const Date = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <h3 className="mb-0">{t("addElementDialog.date.title")}</h3>
      <p>{t("addElementDialog.date.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="name" className="gc-label">
          {t("addElementDialog.date.title")}
        </Label>
        <Description>{t("addElementDialog.date.forExample")}</Description>
        <TextInput
          label="title"
          type={"text"}
          name={"name"}
          placeholder={t("addElementDialog.date.example.dateValue")}
        />
      </ExampleWrapper>
    </div>
  );
};
