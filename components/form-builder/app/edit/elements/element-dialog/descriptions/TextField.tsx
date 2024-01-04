import React from "react";
import { useTranslation } from "next-i18next";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Label, TextInput } from "@components/forms";

export const TextField = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <h3 className="mb-0">{t("addElementDialog.textField.title")}</h3>
      <p>{t("addElementDialog.textField.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="radio-yes" className="gc-label">
          Enter a specific answer
        </Label>
        <Description>For example: a name or number</Description>
        <TextInput label="title" type={"text"} name={"test"} />
      </ExampleWrapper>
    </div>
  );
};
