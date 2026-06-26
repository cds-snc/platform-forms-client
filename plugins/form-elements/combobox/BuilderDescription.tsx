"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { Description, Label } from "@clientComponents/forms";
import { ExampleWrapper } from "@root/plugins/shared";
import { Combobox as ComboboxComponent } from "./Combobox";

const BuilderDescription = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.combobox.title")}</h3>
      <p>{t("addElementDialog.combobox.description")}</p>

      <ExampleWrapper>
        <Label htmlFor="combobox" className="gcds-label">
          {t("addElementDialog.combobox.selectOption")}
        </Label>
        <Description>{t("addElementDialog.combobox.selectOne")}</Description>
        <div className="overflow-hidden p-2">
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

export default BuilderDescription;
