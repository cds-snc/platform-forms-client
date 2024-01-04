import React from "react";
import { ChevronDown } from "@formbuilder/icons";
import { useTranslation } from "react-i18next";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Dropdown, Label } from "@components/forms";

export const DropDown = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.dropdown.title")}</h3>
      <p>{t("addElementDialog.dropdown.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label htmlFor="radio-yes" className="gc-label">
          Select which option applies.
        </Label>
        <Description>Select one.</Description>
        <div className="overflow-hidden">
          <Dropdown name={"name"} choices={["option one", "option two", "option three"]} />
        </div>
      </ExampleWrapper>
    </>
  );
};
