"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "@root/plugins/shared";
import Image from "next/image";
import { AddressComplete as AddressCompleteComponent } from "./AddressComplete";

const BuilderDescription = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <div className="my-4">
        <Image
          src="/img/address-complete.png"
          width={179}
          height={150}
          alt={t("addElementDialog.addressComplete.title")}
          priority
        />
      </div>
      <h3 className="mb-4">{t("addElementDialog.addressComplete.title")}</h3>
      <p>{t("addElementDialog.addressComplete.description")}</p>

      <ExampleWrapper>
        <h4 className="mb-4">{t("addElementDialog.addressComplete.whatIsYourAddress")}</h4>
        <div className="mb-6">
          <AddressCompleteComponent id="test-address" name="test-address" canadianOnly={false} />
        </div>
      </ExampleWrapper>
    </div>
  );
};

export default BuilderDescription;
