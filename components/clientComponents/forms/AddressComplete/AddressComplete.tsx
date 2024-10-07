"use client";
import { AddressCompleteChoice, AddressCompleteProps, AddressElements } from "./types";
import { getAddressCompleteChoices, getSelectedAddress } from "./utils";
import { Combobox, Description, Label, ManagedCombobox } from "@clientComponents/forms";
import { useState, useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { useField } from "formik";
import { cn } from "@lib/utils";
import { SpinnerIcon } from "@serverComponents/icons/SpinnerIcon";
import { Language } from "@lib/types/form-builder-types";
import { countries } from "@lib/managedData/countries";

export const AddressComplete = (props: AddressCompleteProps): React.ReactElement => {
  const { id, name, required, ariaDescribedBy } = props;

  const [field, meta, helpers] = useField(props);

  const { t, i18n } = useTranslation("form-builder");

  //Address Complete elements
  const [choices, setChoices] = useState([""]);
  const [addressResultCache, setAddressResultCache] = useState<AddressCompleteChoice[]>([]); // Cache the results from the address search.

  // Cache and Allow values
  const [isReady, setIsReady] = useState(false);
  const [allow, setAllow] = useState(false);
  const [apiKey, setApiKey] = useState("");
  //const [cache, setCache] = useState<{ [key: string]: AddressElements }>({});

  const toFullAddress = (address: AddressCompleteChoice): string => {
    return address.Text + ", " + address.Description;
  };

  // Check if addressComplete is allowed.
  useEffect(() => {
    const checkAllowed = async () => {
      const response = await fetch("/api/components", { method: "POST" });
      const jsonData = await response.json();
      setAllow(jsonData.allowed);
      setApiKey(jsonData.key);
      setIsReady(true);
    };

    if (apiKey === "") {
      // Don't recheck.
      checkAllowed();
    }
  }, [apiKey]);

  //Form fillers address elements
  const [addressObject, setAddressObject] = useState<AddressElements | null>(null);

  // Update the date object when the field value changes
  useEffect(() => {
    if (field.value) {
      try {
        const parsedValue = JSON.parse(field.value);
        setAddressObject(parsedValue);
      } catch (e) {
        setAddressObject(null);
      }
    }
  }, [field.value]);

  // Update the field value when the date object changes
  useEffect(() => {
    if (addressObject) {
      helpers.setValue(JSON.stringify(addressObject));
    } else {
      helpers.setValue("");
    }
  }, [addressObject, helpers]);

  const onAddressSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!allow) {
      return;
    } // Abandon if addressComplete is disabled.

    const query = e.target.value;
    const responseData = await getAddressCompleteChoices(apiKey, query);

    //loop through the responseData and add it to the addressResultsCache
    const newElements: AddressCompleteChoice[] = [];

    for (let i = 0; i < responseData.length; i++) {
      // Check key doesn't already exist.
      if (
        !addressResultCache.find((item: AddressCompleteChoice) => item.Id === responseData[i].Id)
      ) {
        newElements.push(responseData[i]);
      }
    }

    if (newElements.length > 0) {
      setAddressResultCache((prevCache) => [...prevCache, ...newElements]);
    }

    // Filter the results to avoid duplicate entry
    const uniqueResults = responseData.filter(
      (item: AddressCompleteChoice, index: number, self: AddressCompleteChoice[]) =>
        index ===
        self.findIndex((t) => toFullAddress(t) === toFullAddress(item) && item.Text !== undefined)
    );

    setChoices(
      uniqueResults.map((item: AddressCompleteChoice) => {
        return toFullAddress(item);
      })
    );
  };

  const onAddressSet = async (value: string) => {
    if (!allow) {
      return;
    } // Abandon if addressComplete is disabled.

    const selectedResult = addressResultCache.find(
      (item: AddressCompleteChoice) => toFullAddress(item) === value
    );
    if (selectedResult === undefined) {
      return; // Do nothing, this is not found in the AddressComplete API.
    } else {
      const responseData = await getSelectedAddress(apiKey, selectedResult.Id);
      if (responseData) {
        const results = responseData;
        setAddressObject(results);
      }
    }
  };

  const setAddressData = (key: string, value: string) => {
    if (addressObject == null) {
      setAddressObject({
        unitNumber: "",
        civicNumber: "",
        streetName: "",
        city: "",
        province: "",
        postalCode: "",
        country: "",
      });
    }

    for (const internalKey in addressObject) {
      if (key === internalKey) {
        const newAddressObject = { ...addressObject, [key]: value };
        setAddressObject(newAddressObject);
      }
    }
  };

  const countryChoices = countries.all?.map((country) => {
    return country[i18n.language as Language];
  });

  const setCountry = (countryText: string) => {
    // Get the country from the countries.all object.
    const country = countries.all.find(
      (country) => country[i18n.language as Language] === countryText
    );
    if (country) {
      // set the country in the address object to the ID of the country.
      setAddressData("country", country.Id);
    }
  };

  return (
    <>
      <fieldset
        role="group"
        aria-describedby={ariaDescribedBy ? `desc-${id}` : undefined}
        data-testid="addressComplete"
        id={id}
        tabIndex={0}
      >
        {ariaDescribedBy && (
          <Description id={id} className="gc-form-group-context">
            {ariaDescribedBy}
          </Description>
        )}

        {!props.canadianOnly && (
          <div>
            <input type="hidden" id={`${name}-country`} name={`${name}-country`} value={"CAN"} />
          </div>
        )}
        {!props.canadianOnly && (
          <div className="mb-6">
            <Label htmlFor="country" className="gc-label">
              {t("addElementDialog.addressComplete.country")}
            </Label>
            <Combobox
              id={`${name}-country`}
              name={`${name}-country`}
              choices={countryChoices}
              onSetValue={(val) => setCountry(val)}
              className={cn(meta.error && "gc-error-input")}
              required={required}
              data-testid="addresscomplete-input-country"
            />
          </div>
        )}

        <div className="mb-6">
          <Label htmlFor="street" className="gc-label">
            {t("addElementDialog.addressComplete.street.label")}
          </Label>
          <Description>{t("addElementDialog.addressComplete.street.description")}</Description>
          {isReady && (
            <ManagedCombobox
              choices={choices}
              id={`${name}-streetInput`}
              name={`${name}-streetInput`}
              onChange={onAddressSearch}
              onSetValue={onAddressSet}
              required={required}
            />
          )}
          {!isReady && (
            <>
              <div role="status" className="mt-2">
                <SpinnerIcon className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600" />
                <span className="sr-only">{t("loading")}</span>
              </div>
            </>
          )}
          <input type="hidden" {...field} />
        </div>

        <div className="mb-6">
          <Label htmlFor="unit" className="gc-label">
            {t("addElementDialog.addressComplete.components.unitNumber")}
          </Label>
          <input
            type="text"
            id={`${name}-unit`}
            name={`${name}-unit`}
            key={`${name}-unit-${addressObject?.unitNumber}`}
            onChange={(e) => setAddressData("unitNumber", e.target.value)}
            className={cn("gc-input-text", meta.error && "gc-error-input")}
            value={addressObject?.unitNumber}
            required={required}
            data-testid="addresscomplete-input-unitNumber"
          />
        </div>

        <div className="mb-6">
          <Label htmlFor="civic" className="gc-label">
            {t("addElementDialog.addressComplete.components.civicNumber")}
          </Label>
          <input
            type="text"
            id={`${name}-civic`}
            name={`${name}-civic`}
            key={`${name}-civic-${addressObject?.civicNumber}`}
            onChange={(e) => setAddressData("civicNumber", e.target.value)}
            className={cn("gc-input-text", meta.error && "gc-error-input")}
            value={addressObject?.civicNumber}
            required={required}
            data-testid="addresscomplete-input-civicNumber"
          />
        </div>

        <div className="mb-6">
          <Label htmlFor="street" className="gc-label">
            {t("addElementDialog.addressComplete.components.streetName")}
          </Label>
          <input
            type="text"
            id={`${name}-street`}
            name={`${name}-street`}
            key={`${name}-street-${addressObject?.streetName}`}
            onChange={(e) => setAddressData("streetName", e.target.value)}
            className={cn("gc-input-text", meta.error && "gc-error-input")}
            value={addressObject?.streetName}
            required={required}
            data-testid="addresscomplete-input-streetName"
          />
        </div>

        <div className="mb-6">
          <Label htmlFor="city" className="gc-label">
            {t("addElementDialog.addressComplete.city")}
          </Label>
          <input
            type="text"
            id={`${name}-city`}
            name={`${name}-city`}
            value={addressObject?.city}
            onChange={(e) => setAddressData("city", e.target.value)}
            className={cn("gc-input-text", meta.error && "gc-error-input")}
            required={required}
            data-testid="addresscomplete-input-city"
          />
        </div>

        <div className="mb-6">
          <Label htmlFor="province" className="gc-label">
            {t("addElementDialog.addressComplete.province")}
          </Label>
          <input
            type="text"
            id={`${name}-province`}
            name={`${name}-province`}
            value={addressObject?.province}
            onChange={(e) => setAddressData("province", e.target.value)}
            className={cn("gc-input-text", meta.error && "gc-error-input")}
            required={required}
            data-testid="addresscomplete-input-province"
          />
        </div>

        <div className="mb-6">
          <Label htmlFor="postal" className="gc-label">
            {t("addElementDialog.addressComplete.postal")}
          </Label>
          <input
            id={`${name}-postal`}
            type="text"
            name={`${name}-postal`}
            value={addressObject?.postalCode}
            onChange={(e) => setAddressData("postalCode", e.target.value)}
            className={cn("gc-input-text", meta.error && "gc-error-input")}
            required={required}
            data-testid="addresscomplete-input-postalCode"
          />
        </div>
      </fieldset>
    </>
  );
};