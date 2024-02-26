"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Combobox as ComboboxComponent, Description, Label } from "@clientComponents/forms";

export const Combobox = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.combobox.title")}</h3>
      <p>{t("addElementDialog.combobox.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="combobox" className="gc-label">
          {t("addElementDialog.combobox.selectOption")}
        </Label>
        <Description>{t("addElementDialog.combobox.selectOne")}</Description>
        <div className="overflow-hidden">
          <ComboboxComponent
            name="name"
            id="combobox"
            choices={t("addElementDialog.combobox.choices").split(",")}
          />
        </div>
      </ExampleWrapper>
    </>
  );
};
