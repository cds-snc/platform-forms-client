"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Label, TextInput } from "@clientComponents/forms";

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
        <TextInput id="name" type="text" name="name" autoComplete="name" />
      </ExampleWrapper>
    </div>
  );
};
