"use client";
import React from "react";
import { Trans } from "react-i18next";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { AddressComplete as AddressCompleteComponent } from "@clientComponents/forms/AddressComplete/AddressComplete";
import Image from "next/image";

export const AddressComplete = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <h3 className="mb-4">{t("addElementDialog.addressComplete.title")}</h3>
      <p className="mb-4">
        <Trans
          ns="form-builder"
          i18nKey="addElementDialog.addressComplete.description1"
          components={{
            image: (
              <Image
                src="/img/address-complete.png"
                width="139"
                height="110"
                alt={t("addElementDialog.addressComplete.logoAltText")}
                preload
                className="ml-1 inline-block"
              />
            ),
          }}
        />
      </p>
      <p>
        <Trans ns="form-builder" i18nKey="addElementDialog.addressComplete.description2" />
      </p>

      <ExampleWrapper>
        <h4 className="mb-4">{t("addElementDialog.addressComplete.whatIsYourAddress")}</h4>
        <div>
          <AddressCompleteComponent id="test-address" name="test-address" canadianOnly={true} />
        </div>
      </ExampleWrapper>
    </div>
  );
};
