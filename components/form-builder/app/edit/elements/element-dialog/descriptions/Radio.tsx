import React from "react";
import { useTranslation } from "next-i18next";
import { Description, Radio as ExampleRadio, Label } from "@components/forms";
import { ExampleWrapper } from "./ExampleWrapper";

export const Radio = () => {
  const { t } = useTranslation("form-builder");

  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.radio.title")}</h3>
      <p>{t("addElementDialog.radio.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="radio-yes" className="gc-label">
          Ask your question in this label
        </Label>
        <Description>
          Add a description to your question to give your form fillers more context
        </Description>
        <div className="overflow-hidden">
          <ExampleRadio id="radio-yes" label="Yes" required={false} value="yes" name="name" />
          <ExampleRadio id="radio-no" label="No" required={false} value="no" name="name" />
          <ExampleRadio
            id="radio-maybe"
            label="Maybe so"
            required={false}
            value="maybe"
            name="name"
          />
        </div>
      </ExampleWrapper>
    </>
  );
};
