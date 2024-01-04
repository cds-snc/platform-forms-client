import React from "react";
import { useTranslation } from "next-i18next";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Label, TextInput } from "@components/forms";

export const Address = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <h3 className="mb-0">{t("addElementDialog.address.title")}</h3>
      <p>{t("addElementDialog.address.description")}</p>

      <ExampleWrapper className="mt-4">
        <div className="mb-6">
          <Label htmlFor="street" className="gc-label">
            {t("addElementDialog.address.street.label")}
          </Label>
          <Description>{t("addElementDialog.address.street.description")}</Description>
          <TextInput type="text" id="street" name="street" />
        </div>
        <div className="mb-6">
          <Label htmlFor="city" className="gc-label">
            {t("addElementDialog.address.city")}
          </Label>
          <TextInput type="text" id="city" name="city" />
        </div>
        <div className="mb-6">
          <Label htmlFor="province" className="gc-label">
            {t("addElementDialog.address.province")}
          </Label>
          <TextInput type="text" id="province" name="province" />
        </div>
        <div className="mb-6">
          <Label htmlFor="country" className="gc-label">
            {t("addElementDialog.address.country")}
          </Label>
          <TextInput id="country" type="text" name="country" />
        </div>
        <div className="mb-6">
          <Label htmlFor="postal" className="gc-label">
            {t("addElementDialog.address.postal")}
          </Label>
          <TextInput id="postal" type="text" name="postal" />
        </div>
      </ExampleWrapper>
    </div>
  );
};
