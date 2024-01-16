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
          <legend className="gc-label">{t("addElementDialog.checkbox.chooseItems")}</legend>
          <Description>{t("addElementDialog.checkbox.selectAllThatApply")}</Description>

          <Checkbox label={t("addElementDialog.checkboxItem")} id="item1" name={"name"} />
          <Checkbox label={t("addElementDialog.checkboxItem")} id="item2" name={"name"} />
          <Checkbox label={t("addElementDialog.checkboxItem")} id="item3" name={"name"} />
        </FormGroup>
      </ExampleWrapper>
    </>
  );
};
