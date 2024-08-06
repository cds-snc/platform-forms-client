"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Label, TextInput } from "@clientComponents/forms";

export const AddressComplete = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <img src="/img/address-complete.png" width="179" className="mb-4 mt-4" />
      <h3 className="mb-4">{t("addElementDialog.addressComplete.title")}</h3>
      <p>{t("addElementDialog.addressComplete.description")}</p>

      <ExampleWrapper className="mt-4">
        <h4 className="mb-4">{t("addElementDialog.addressComplete.whatIsYourAddress")}</h4>
        <div className="mb-6">
          <Label htmlFor="street" className="gc-label">
            {t("addElementDialog.addressComplete.street.label")}
          </Label>
          <Description>{t("addElementDialog.addressComplete.street.description")}</Description>
          <TextInput type="text" id="street" name="street" autoComplete="address-line1" />
        </div>
        <div className="mb-6">
          <Label htmlFor="city" className="gc-label">
            {t("addElementDialog.addressComplete.city")}
          </Label>
          <TextInput type="text" id="city" name="city" autoComplete="address-level2" />
        </div>
        <div className="mb-6">
          <Label htmlFor="province" className="gc-label">
            {t("addElementDialog.addressComplete.province")}
          </Label>
          <TextInput type="text" id="province" name="province" autoComplete="address-level1" />
        </div>
        <div className="mb-6">
          <Label htmlFor="postal" className="gc-label">
            {t("addElementDialog.addressComplete.postal")}
          </Label>
          <TextInput id="postal" type="text" name="postal" autoComplete="postal-code" />
        </div>
      </ExampleWrapper>
    </div>
  );
};
