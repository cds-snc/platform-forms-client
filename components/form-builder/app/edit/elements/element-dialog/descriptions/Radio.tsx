import React from "react";
import { useTranslation } from "next-i18next";
import { Description, Radio as RadioComponent, Label } from "@components/forms";
import { ExampleWrapper } from "./ExampleWrapper";

export const Radio = () => {
  const { t } = useTranslation("form-builder");

  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.radio.title")}</h3>
      <p>{t("addElementDialog.radio.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="radio-yes" className="gc-label">
          Choose an option
        </Label>
        <Description>ASelect only one.</Description>
        <div className="overflow-hidden">
          <RadioComponent
            id="radio-yes"
            label="Option A"
            required={false}
            value="yes"
            name="name"
          />
          <RadioComponent id="radio-no" label="Option B" required={false} value="no" name="name" />
        </div>
      </ExampleWrapper>
    </>
  );
};
