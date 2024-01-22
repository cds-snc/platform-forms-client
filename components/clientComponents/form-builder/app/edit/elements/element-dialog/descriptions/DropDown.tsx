"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Dropdown, Label } from "@clientComponents/forms";

export const DropDown = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.dropdown.title")}</h3>
      <p>{t("addElementDialog.dropdown.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="dropdown" className="gc-label">
          {t("addElementDialog.dropdown.selectOption")}
        </Label>
        <Description>{t("addElementDialog.dropdown.selectOne")}</Description>
        <div className="overflow-hidden">
          <Dropdown
            name="name"
            id="dropdown"
            choices={t("addElementDialog.dropdown.choices").split(",")}
          />
        </div>
      </ExampleWrapper>
    </>
  );
};
