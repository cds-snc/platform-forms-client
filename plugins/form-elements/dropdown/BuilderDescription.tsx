"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { Description, Label } from "@clientComponents/forms";
import { ExampleWrapper } from "@root/plugins/shared";
import { Dropdown } from "./Dropdown";

const BuilderDescription = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h3 data-testid="element-description-title" className="mb-0">
        {t("addElementDialog.dropdown.title")}
      </h3>
      <p data-testid="element-description-text">{t("addElementDialog.dropdown.description")}</p>

      <ExampleWrapper>
        <Label htmlFor="dropdown" className="gcds-label">
          {t("addElementDialog.dropdown.selectOption")}
        </Label>
        <Description>{t("addElementDialog.dropdown.selectOne")}</Description>
        <div className="overflow-hidden p-2">
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

export default BuilderDescription;
