"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Combobox, Description, Label } from "@clientComponents/forms";

export const Departments = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.departments.title")}</h3>
      <p>{t("addElementDialog.departments.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="dropdown" className="gc-label">
          {t("addElementDialog.departments.selectOption")}
        </Label>
        <Description>{t("addElementDialog.departments.selectOne")}</Description>
        <div className="overflow-hidden">
          <Combobox
            name="name"
            id="dropdown"
            choices={t("addElementDialog.departments.choices").split(",")}
          />
        </div>
      </ExampleWrapper>
    </>
  );
};
