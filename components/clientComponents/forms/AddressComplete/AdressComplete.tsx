"use client";
import { AddressCompleteChoice, AddressCompleteResult, AddressCompleteProps } from "./types";
import { getAddressCompleteChoices, getSelectedAddress } from "./utils";
import { Description, Label, TextInput, Combobox } from "@clientComponents/forms";
import { useState } from "react";
import { useTranslation } from "@i18n/client";

export const AddressComplete = (props: AddressCompleteProps): React.ReactElement => {
  const { id, name, required, ariaDescribedBy } = props;

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

    const filteredCache = addressResultCache.filter((item: AddressCompleteChoice) => item.Text);
    setChoices(
      filteredCache.map((item: AddressCompleteChoice) => {
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
    <>
      <fieldset aria-describedby={id}>
        {ariaDescribedBy && (
          <Description id={id} className="gc-form-group-context">
            {ariaDescribedBy}
          </Description>
        )}
        <div className="mb-6">
          <Label htmlFor="street" className="gc-label">
            {t("addElementDialog.addressComplete.street.label")}
          </Label>
          <Description>{t("addElementDialog.addressComplete.street.description")}</Description>
          <Combobox
            choices={choices}
            id="street"
            name={`${name}-street`}
            onChange={onAddressSearch}
            onSetValue={onAddressSet}
            required={required}
          />
          <input
            type="hidden"
            id="addressCompleteData"
            name={`${name}-addressCompleteData`}
            value={addressCompleteData}
            required={required}
          />
        </div>
        {props.unitNumber && (
          <div className="mb-6">
            <Label htmlFor="unit" className="gc-label">
              {t("addElementDialog.addressComplete.components.unitNumber")}
            </Label>
            <TextInput
              type="text"
              id="unit"
              name={`${name}-unit`}
              autoComplete="address-line2"
              required={required}
            />
          </div>
        )}
        {props.civicNumber && (
          <div className="mb-6">
            <Label htmlFor="civic" className="gc-label">
              {t("addElementDialog.addressComplete.components.civicNumber")}
            </Label>
            <TextInput
              type="text"
              id="civic"
              name={`${name}-civic`}
              autoComplete="address-line2"
              disabled
              required={required}
            />
          </div>
        )}
        {props.streetName && (
          <div className="mb-6">
            <Label htmlFor="street" className="gc-label">
              {t("addElementDialog.addressComplete.components.streetName")}
            </Label>
            <TextInput
              type="text"
              id="street"
              name={`${name}-street`}
              autoComplete="address-line1"
              disabled
              required={required}
            />
          </div>
        )}
        {props.city && (
          <div className="mb-6">
            <Label htmlFor="city" className="gc-label">
              {t("addElementDialog.addressComplete.city")}
            </Label>
            <TextInput
              type="text"
              id="city"
              name={`${name}-city`}
              autoComplete="address-level2"
              disabled
              required={required}
            />
          </div>
        )}
        {props.province && (
          <div className="mb-6">
            <Label htmlFor="province" className="gc-label">
              {t("addElementDialog.addressComplete.province")}
            </Label>
            <TextInput
              type="text"
              id="province"
              name={`${name}-province`}
              autoComplete="address-level1"
              disabled
              required={required}
            />
          </div>
        )}
        {props.postalCode && (
          <div className="mb-6">
            <Label htmlFor="postal" className="gc-label">
              {t("addElementDialog.addressComplete.postal")}
            </Label>
            <TextInput
              id="postal"
              type="text"
              name={`${name}-postal`}
              autoComplete="postal-code"
              disabled
              required={required}
            />
          </div>
        )}
        {props.country && (
          <div className="mb-6">
            <Label htmlFor="country" className="gc-label">
              {t("addElementDialog.addressComplete.country")}
            </Label>
            <TextInput
              type="text"
              id="country"
              name={`${name}-country`}
              autoComplete="country"
              disabled
              required={required}
            />
          </div>
        )}
      </fieldset>
    </>
  );
};
