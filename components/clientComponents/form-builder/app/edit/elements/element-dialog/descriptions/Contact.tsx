"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { Label, TextInput, Radio as RadioComponent } from "@clientComponents/forms";
import { ExampleWrapper } from "./ExampleWrapper";

export const Contact = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <h3 className="mb-0">{t("addElementDialog.contact.title")}</h3>
      <p>{t("addElementDialog.contact.description")}</p>

      <ExampleWrapper className="mt-4">
        <h4 className="mb-4">{t("addElementDialog.contact.howCanWeContactYou")}</h4>
        <div className="mb-6">
          <Label htmlFor="phone" className="gc-label">
            {t("addElementDialog.contact.phone.label")}
          </Label>
          <TextInput type="text" id="phone" name="phone" autoComplete="tel" />
        </div>
        <div className="mb-6">
          <Label htmlFor="email" className="gc-label">
            {t("addElementDialog.contact.email.label")}
          </Label>
          <TextInput type="text" id="email" name="email" autoComplete="email" />
        </div>
        <div className="mb-6">
          <Label htmlFor="radio-english" className="gc-label">
            {t("addElementDialog.contact.language.label")}
          </Label>
          <div className="overflow-hidden">
            <RadioComponent
              id="radio-english"
              label={t("addElementDialog.contact.language.english")}
              required={false}
              value="french"
              name="language"
            />
            <RadioComponent
              id="radio-no"
              label={t("addElementDialog.contact.language.french")}
              required={false}
              value="french"
              name="language"
            />
          </div>
        </div>
      </ExampleWrapper>
    </div>
  );
};
