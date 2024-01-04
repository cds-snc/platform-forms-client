import React from "react";
import { useTranslation } from "next-i18next";

import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Label, TextArea as TextAreaComponent } from "@components/forms";

export const TextArea = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <h3 className="mb-0">{t("addElementDialog.textArea.title")}</h3>
      <p>{t("addElementDialog.textArea.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="radio-yes" className="gc-label">
          Ask your question in this label
        </Label>
        <Description>
          Add a description to your question to give your form fillers more context
        </Description>
        <TextAreaComponent
          characterCountMessages={{
            part1: "characters",
            part2: "characters",
            part1Error: "error",
            part2Error: "error",
          }}
          name={"test"}
        />
      </ExampleWrapper>
    </div>
  );
};
