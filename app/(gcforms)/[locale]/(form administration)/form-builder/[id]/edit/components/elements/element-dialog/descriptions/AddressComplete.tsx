"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, Label, TextInput, Combobox } from "@clientComponents/forms";
import { useState } from "react";
import {
  AddressCompleteChoice,
  AddressCompleteResult,
  getAddressCompleteChoices,
  getSelectedAddress,
} from "@clientComponents/globals/AddressComplete";
import Image from "next/image";

export const AddressComplete = () => {
  const { t } = useTranslation("form-builder");

  const [choices, setChoices] = useState([""]);
  const [addressResultCache, setAddressResultCache] = useState<AddressCompleteChoice[]>([]); // Cache the results from the address search.
  const [addressCompleteData, setAddressCompleteData] = useState(""); // The full result as JSON.

  const onAddressSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    const responseData = await getAddressCompleteChoices(query);

    //loop through the responseData and add it to the addressResultsCache
    for (let i = 0; i < responseData.length; i++) {
      //Check key doesn't already exist.
      if (
        addressResultCache.find((item: AddressCompleteChoice) => item.Text === responseData[i].Text)
      ) {
        continue;
      }
      const newCache = [...addressResultCache, responseData[i]];
      setAddressResultCache(newCache);
    }

    setChoices(
      addressResultCache.map((item: AddressCompleteChoice) => {
        return item.Text;
      })
    );
  };

  const onAddressSet = async (value: string) => {
    const selectedResult = addressResultCache.find(
      (item: AddressCompleteChoice) => item.Text === value
    );
    if (selectedResult === undefined) {
      return; // Do nothing, this is not found in the AddressComplete API.
    } else {
      const responseData = await getSelectedAddress(selectedResult.Id);
      if (responseData) {
        const results = responseData;
        const line1 = results.find((obj: AddressCompleteResult) => {
          return obj.FieldGroup === "Common" && obj.FieldName === "Line1";
        });

        const city = results.find((obj: AddressCompleteResult) => {
          return obj.FieldGroup === "Common" && obj.FieldName === "City";
        });

        const province = results.find((obj: AddressCompleteResult) => {
          return obj.FieldGroup === "Common" && obj.FieldName === "ProvinceCode";
        });

        const postal = results.find((obj: AddressCompleteResult) => {
          return obj.FieldGroup === "Common" && obj.FieldName === "PostalCode";
        });

        const address = {
          line1: line1?.FormattedValue,
          city: city?.FormattedValue,
          province: province?.FormattedValue,
          postal: postal?.FormattedValue,
        };
        setAddressCompleteData(JSON.stringify(address));
      }
    }
  };

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
          <Combobox
            choices={choices}
            id="street"
            name="street"
            onChange={onAddressSearch}
            onSetValue={onAddressSet}
          />
          <input
            type="hidden"
            id="addressCompleteData"
            name="addressCompleteData"
            value={addressCompleteData}
          />
        </div>
        <div className="mb-6">
          <Label htmlFor="city" className="gc-label">
            {t("addElementDialog.addressComplete.city")}
          </Label>
          <TextInput type="text" id="city" name="city" autoComplete="address-level2" disabled />
        </div>
        <div className="mb-6">
          <Label htmlFor="province" className="gc-label">
            {t("addElementDialog.addressComplete.province")}
          </Label>
          <TextInput
            type="text"
            id="province"
            name="province"
            autoComplete="address-level1"
            disabled
          />
        </div>
        <div className="mb-6">
          <Label htmlFor="postal" className="gc-label">
            {t("addElementDialog.addressComplete.postal")}
          </Label>
          <TextInput id="postal" type="text" name="postal" autoComplete="postal-code" disabled />
        </div>
      </ExampleWrapper>
    </div>
  );
};
