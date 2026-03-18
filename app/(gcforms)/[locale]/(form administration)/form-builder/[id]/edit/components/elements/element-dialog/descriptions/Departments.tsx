"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Label } from "@clientComponents/forms";
import { managedData } from "@lib/managedData";
import { Language } from "@lib/types/form-builder-types";

export const Departments = () => {
  const { t, i18n } = useTranslation("form-builder");
  const departments = managedData.departments;

  const choices = departments?.map((department) => {
    return department[i18n.language as Language];
  });

  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.departments.title")}</h3>
      <p>{t("addElementDialog.departments.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="dropdown" className="gcds-label">
          {t("addElementDialog.departments.selectOption")}
        </Label>
        <Description id="dropdown">{t("addElementDialog.departments.selectOne")}</Description>
        <div className="overflow-hidden p-2">
          <div className="gcds-select-wrapper">
            <select
              id="dropdown"
              className="gc-dropdown"
              aria-describedby="desc-dropdown"
              defaultValue=""
            >
              <option value="">{t("addElementDialog.departments.example.select")}</option>
              {choices?.map((choice) => (
                <option key={choice} value={choice}>
                  {choice}
                </option>
              ))}
            </select>
          </div>
        </div>
      </ExampleWrapper>
    </>
  );
};
