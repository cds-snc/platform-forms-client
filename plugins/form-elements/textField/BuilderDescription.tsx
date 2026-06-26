"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "@root/plugins/shared";
import { TextInput } from "@root/plugins/shared";
import { Description, Label } from "@clientComponents/forms";

const TextFieldDescription = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <h3 className="mb-0" data-testid="element-description-title">
        {t("addElementDialog.textField.title")}
      </h3>
      <p data-testid="element-description-text">{t("addElementDialog.textField.description")}</p>
      <ExampleWrapper className="gcds-input-wrapper">
        <Label htmlFor="name" className="gcds-label">
          {t("addElementDialog.textField.enterAnswer")}
        </Label>
        <Description>{t("addElementDialog.textField.forExample")}</Description>
        <TextInput label="title" id="name" type={"text"} name={"name"} />
      </ExampleWrapper>
    </div>
  );
};

export default TextFieldDescription;
