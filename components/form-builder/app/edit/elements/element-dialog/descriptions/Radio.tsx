import React from "react";
import { useTranslation } from "next-i18next";
import { Description, Radio as RadioComponent, Label, FormGroup } from "@components/forms";
import { ExampleWrapper } from "./ExampleWrapper";

export const Radio = () => {
  const { t } = useTranslation("form-builder");

  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.radio.title")}</h3>
      <p>{t("addElementDialog.radio.description")}</p>

      <ExampleWrapper className="mt-4">
        <FormGroup name={"radios"}>
          <legend data-testid="label" className="gc-label" id="label-1">
            Choose an option
          </legend>
          <Description>Select only one.</Description>

          <RadioComponent
            id="radio-yes"
            label="Option A"
            required={false}
            value="yes"
            name="name"
          />
          <RadioComponent id="radio-no" label="Option B" required={false} value="no" name="name" />
        </FormGroup>
      </ExampleWrapper>
    </>
  );
};
