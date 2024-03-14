"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Label, TextInput } from "@clientComponents/forms";

export const FirstMiddleLastName = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <h3 className="mb-0">{t("addElementDialog.firstMiddleLastName.title")}</h3>
      <p>{t("addElementDialog.firstMiddleLastName.description")}</p>

      <ExampleWrapper className="mt-4">
        <h4 className="mb-4">{t("addElementDialog.firstMiddleLastName.whatIsYourName")}</h4>
        <div className="mb-6">
          <Label htmlFor="first" className="gc-label">
            {t("addElementDialog.firstMiddleLastName.first.label")}
          </Label>
          <TextInput id="first" type="text" name="first" autoComplete="given-name" />
        </div>
        <div className="mb-6">
          <Label htmlFor="middle" className="gc-label">
            {t("addElementDialog.firstMiddleLastName.middle.label")}
          </Label>
          <TextInput id="middle" type="text" name="middle" autoComplete="additional-name" />
        </div>
        <div className="mb-6">
          <Label htmlFor="last" className="gc-label">
            {t("addElementDialog.firstMiddleLastName.last.label")}
          </Label>
          <TextInput id="last" type="text" name="last" autoComplete="family-name" />
        </div>
      </ExampleWrapper>
    </div>
  );
};
