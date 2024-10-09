"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { AddressComplete as AddressCompleteComponent } from "@clientComponents/forms/AddressComplete/AddressComplete";
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
          <AddressCompleteComponent id="test-address" name="test-address" canadianOnly={false} />
        </div>
      </ExampleWrapper>
    </div>
  );
};
