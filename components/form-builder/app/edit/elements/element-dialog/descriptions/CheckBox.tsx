import React from "react";
import { useTranslation } from "next-i18next";
import { ExampleWrapper } from "./ExampleWrapper";
import { Checkbox, Description, FormGroup } from "@components/forms";

export const CheckBox = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.checkbox.title")}</h3>
      <p>{t("addElementDialog.checkbox.description")}</p>

      <ExampleWrapper className="mt-4">
        <FormGroup name={"checkboxes"}>
          <legend className="gc-label">Choose items</legend>
          <Description>Select all that apply.</Description>

          <Checkbox label={"Item one"} id="item1" name={"name"} />
          <Checkbox label={"Item two"} id="item2" name={"name"} />
          <Checkbox label={"Item three"} id="item3" name={"name"} />
        </FormGroup>
      </ExampleWrapper>
    </>
  );
};
