"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "@root/plugins/shared";
import { TextArea as TextAreaComponent } from "./TextArea";
import { Description, Label } from "@clientComponents/forms";

const TextAreaDescription = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <h3 className="mb-0" data-testid="element-description-title">
        {t("addElementDialog.textArea.title")}
      </h3>
      <p data-testid="element-description-text">{t("addElementDialog.textArea.description")}</p>
      <ExampleWrapper className="gcds-textarea-wrapper">
        <Label htmlFor="textarea" className="gcds-label">
          {t("addElementDialog.textArea.enterAnswer")}
        </Label>
        <Description>{t("addElementDialog.textArea.forExample")}</Description>
        <TextAreaComponent id="textarea" name={"test"} />
      </ExampleWrapper>
    </div>
  );
};

export default TextAreaDescription;
