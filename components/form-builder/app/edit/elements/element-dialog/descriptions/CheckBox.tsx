import React from "react";
import { useTranslation } from "next-i18next";
import { ExampleWrapper } from "./ExampleWrapper";
import { Checkbox, Description, Label } from "@components/forms";

export const CheckBox = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.checkbox.title")}</h3>
      <p>{t("addElementDialog.checkbox.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label className="gc-label">Ask your question in this label</Label>
        <Description>
          Add a description to your question to give your form fillers more context
        </Description>
        <div className="overflow-hidden">
          <Checkbox label={"Option one"} name={"name"} />
          <Checkbox label={"Option two"} name={"name"} />
          <Checkbox label={"Option three"} name={"name"} />
        </div>
      </ExampleWrapper>
    </>
  );
};
