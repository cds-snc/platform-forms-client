"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Label } from "@clientComponents/forms";
import { AddressComplete as AddressCompleteComponent } from "@clientComponents/forms/AddressComplete/AdressComplete";
import Image from "next/image";

export const AddressComplete = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <Image
        src="/img/address-complete.png"
        width="179"
        height="150"
        className="mb-4 mt-4"
        alt={t("addElementDialog.addressComplete.title")}
      />
      <h3 className="mb-4">{t("addElementDialog.addressComplete.title")}</h3>
      <p>{t("addElementDialog.addressComplete.description")}</p>

      <ExampleWrapper className="mt-4">
        <h4 className="mb-4">{t("addElementDialog.addressComplete.whatIsYourAddress")}</h4>
        <div className="mb-6">
          <Label htmlFor="street" className="gc-label">
            {t("addElementDialog.addressComplete.street.label")}
          </Label>
          <Description>{t("addElementDialog.addressComplete.street.description")}</Description>
          <AddressCompleteComponent name={"addressComplete"} />
        </div>
      </ExampleWrapper>
    </div>
  );
};
