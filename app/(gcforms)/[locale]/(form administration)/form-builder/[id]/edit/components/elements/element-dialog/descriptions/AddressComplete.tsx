"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { AddressComplete as AddressCompleteComponent } from "@clientComponents/forms/AddressComplete/AdressComplete";
import Image from "next/image";
import { AddressCompleteProps } from "@clientComponents/forms/AddressComplete/types";

export const AddressComplete = () => {
  const { t } = useTranslation("form-builder");

  const props = {
    unitNumber: true,
    civicNumber: true,
    streetName: true,
    city: true,
    province: true,
    postalCode: true,
    country: true,
  } as AddressCompleteProps;

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
          <AddressCompleteComponent {...props} />
        </div>
      </ExampleWrapper>
    </div>
  );
};
