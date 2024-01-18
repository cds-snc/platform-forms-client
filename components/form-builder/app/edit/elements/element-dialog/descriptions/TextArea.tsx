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
        <Label htmlFor="textarea" className="gc-label">
          {t("addElementDialog.textArea.enterAnswer")}
        </Label>
        <Description>{t("addElementDialog.textArea.forExample")}</Description>
        <TextAreaComponent
          id="textarea"
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
