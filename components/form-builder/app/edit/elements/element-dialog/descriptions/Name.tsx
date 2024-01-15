import React from "react";
import { useTranslation } from "next-i18next";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Label, TextInput } from "@components/forms";

export const Name = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <h3 className="mb-0">{t("addElementDialog.name.title")}</h3>
      <p>{t("addElementDialog.name.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="name" className="gc-label">
          {t("addElementDialog.name.label")}
        </Label>
        <Description>{t("addElementDialog.name.description")}</Description>
        <TextInput id="name" type="text" name="name" autoComplete="name" />
      </ExampleWrapper>
    </div>
  );
};
