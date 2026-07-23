"use client";
import React, { useState } from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Combobox, Description, Label } from "@clientComponents/forms";
import { managedData } from "@lib/managedData";
import { Language } from "@lib/types/form-builder-types";
import { PropertyChoices } from "@lib/types";

export const Departments = () => {
  const { t, i18n } = useTranslation("form-builder");
  const departments = managedData.departments;
  const lang = i18n.language as Language;

  // allow a bilingual translation — automatically updates when App lang changes
  const [selectedDept, setSelectedDept] = useState<PropertyChoices | null>(null);
  const choices = departments?.map((department) => department[lang]) ?? [];
  const currentValue = selectedDept ? selectedDept[lang] : "";

  // Used with ExampleWrapper when key={lang} remounts the translated value is used
  const handleValueChange = (value: string) => {
    const dept = departments?.find((d) => d[lang].toLowerCase() === value.toLowerCase()) ?? null;
    setSelectedDept(dept);
  };

  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.departments.title")}</h3>
      <p>{t("addElementDialog.departments.description")}</p>

      <ExampleWrapper key={lang} initialValues={{ name: currentValue }}>
        <Label htmlFor="dropdown" id="label-dropdown" className="gcds-label">
          {t("addElementDialog.departments.selectOption")}
        </Label>
        <Description id="desc-dropdown">{t("addElementDialog.departments.selectOne")}</Description>
        <div className="overflow-hidden p-2">
          <Combobox
            name="name"
            id="dropdown"
            ariaDescribedBy="desc-dropdown"
            choices={choices}
            onValueChange={handleValueChange}
          />
        </div>
      </ExampleWrapper>
    </>
  );
};
