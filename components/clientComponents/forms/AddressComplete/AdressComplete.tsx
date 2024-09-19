"use client";
import { AddressCompleteChoice, AddressCompleteProps, AddressElements } from "./types";
import { getAddressCompleteChoices, getSelectedAddress } from "./utils";
import { Description, Label, ManagedCombobox } from "@clientComponents/forms";
import { useState, useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { useField } from "formik";
import { cn } from "@lib/utils";
import { SpinnerIcon } from "@serverComponents/icons/SpinnerIcon";

export const AddressComplete = (props: AddressCompleteProps): React.ReactElement => {
  const { id, name, required, ariaDescribedBy } = props;

  const [field, meta, helpers] = useField(props);

  const { t } = useTranslation("form-builder");

  //Address Complete elements
  const [choices, setChoices] = useState([""]);
  const [addressResultCache, setAddressResultCache] = useState<AddressCompleteChoice[]>([]); // Cache the results from the address search.

  // Cache and Allow values
  const [isReady, setIsReady] = useState(false);
  const [allow, setAllow] = useState(false);
  const [apiKey, setApiKey] = useState("");
  //const [cache, setCache] = useState<{ [key: string]: AddressElements }>({});

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
  }, []);

  //Form fillers address elements
  const [addressObject, setAddressObject] = useState<AddressElements>({
    unitNumber: "",
    civicNumber: "",
    streetName: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
  });

  // Update the date object when the field value changes
  useEffect(() => {
    if (field.value) {
      try {
        const parsedValue = JSON.parse(field.value);
        setAddressObject(parsedValue);
      } catch (e) {
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

    // Filter the results to avoid duplicate "text" entry
    const uniqueResults = addressResultCache.filter(
      (item: AddressCompleteChoice, index: number, self: AddressCompleteChoice[]) =>
        index === self.findIndex((t) => t.Text === item.Text && item.Text !== undefined)
    );

    setChoices(
      uniqueResults.map((item: AddressCompleteChoice) => {
        return item.Text;
      })
    );
  };

  const onAddressSet = async (value: string) => {
    if (!allow) {
      return;
    } // Abandon if addressComplete is disabled.

    const selectedResult = addressResultCache.find(
      (item: AddressCompleteChoice) => item.Text === value
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
          {isReady && (
            <ManagedCombobox
              choices={choices}
              id={`${name}-streetInput`}
              name={`${name}-streetInput`}
              onChange={onAddressSearch}
              onSetValue={onAddressSet}
              required={required}
              activeRefresh={true}
            />
          )}
          {!isReady && (
            <>
              <Label htmlFor="street" className="gc-label">
                {t("addElementDialog.addressComplete.street.label")}
              </Label>
              <Description>{t("addElementDialog.addressComplete.street.description")}</Description>
              <div role="status" className="mt-2">
                <SpinnerIcon className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600" />
                <span className="sr-only">{t("loading")}</span>
              </div>
            </>
          )}
          <input type="hidden" {...field} />
        </div>
        {props.unitNumber && (
          <div className="mb-6">
            <Label htmlFor="unit" className="gc-label">
              {t("addElementDialog.addressComplete.components.unitNumber")}
            </Label>
            <input
              type="text"
              id={`${name}-unit`}
              name={`${name}-unit`}
              key={`${name}-unit-${addressObject.unitNumber}`}
              onChange={(e) =>
                setAddressObject((prev) => ({ ...prev, unitNumber: e.target.value }))
              }
              className={cn("gc-input-text", meta.error && "gc-error-input")}
              value={addressObject.unitNumber}
              required={required}
              data-testid="addresscomplete-input-unitNumber"
            />
          </div>
        )}
        {props.civicNumber && (
          <div className="mb-6">
            <Label htmlFor="civic" className="gc-label">
              {t("addElementDialog.addressComplete.components.civicNumber")}
            </Label>
            <input
              type="text"
              id={`${name}-civic`}
              name={`${name}-civic`}
              key={`${name}-civic-${addressObject.civicNumber}`}
              onChange={(e) =>
                setAddressObject((prev) => ({ ...prev, civicNumber: e.target.value }))
              }
              className={cn("gc-input-text", meta.error && "gc-error-input")}
              value={addressObject.civicNumber}
              required={required}
              data-testid="addresscomplete-input-civicNumber"
            />
          </div>
        )}
        {props.streetName && (
          <div className="mb-6">
            <Label htmlFor="street" className="gc-label">
              {t("addElementDialog.addressComplete.components.streetName")}
            </Label>
            <input
              type="text"
              id={`${name}-street`}
              name={`${name}-street`}
              key={`${name}-street-${addressObject.streetName}`}
              onChange={(e) =>
                setAddressObject((prev) => ({ ...prev, streetName: e.target.value }))
              }
              className={cn("gc-input-text", meta.error && "gc-error-input")}
              value={addressObject.streetName}
              required={required}
              data-testid="addresscomplete-input-streetName"
            />
          </div>
        )}
        {props.city && (
          <div className="mb-6">
            <Label htmlFor="city" className="gc-label">
              {t("addElementDialog.addressComplete.city")}
            </Label>
            <input
              type="text"
              id={`${name}-city`}
              name={`${name}-city`}
              value={addressObject.city}
              onChange={(e) => setAddressObject((prev) => ({ ...prev, city: e.target.value }))}
              className={cn("gc-input-text", meta.error && "gc-error-input")}
              required={required}
              data-testid="addresscomplete-input-city"
            />
          </div>
        )}
        {props.province && (
          <div className="mb-6">
            <Label htmlFor="province" className="gc-label">
              {t("addElementDialog.addressComplete.province")}
            </Label>
            <input
              type="text"
              id={`${name}-province`}
              name={`${name}-province`}
              value={addressObject.province}
              onChange={(e) => setAddressObject((prev) => ({ ...prev, province: e.target.value }))}
              className={cn("gc-input-text", meta.error && "gc-error-input")}
              required={required}
              data-testid="addresscomplete-input-province"
            />
          </div>
        )}
        {props.postalCode && (
          <div className="mb-6">
            <Label htmlFor="postal" className="gc-label">
              {t("addElementDialog.addressComplete.postal")}
            </Label>
            <input
              id={`${name}-postal`}
              type="text"
              name={`${name}-postal`}
              value={addressObject.postalCode}
              onChange={(e) =>
                setAddressObject((prev) => ({ ...prev, postalCode: e.target.value }))
              }
              className={cn("gc-input-text", meta.error && "gc-error-input")}
              required={required}
              data-testid="addresscomplete-input-postalCode"
            />
          </div>
        )}
        {props.country && (
          <div className="mb-6">
            <Label htmlFor="country" className="gc-label">
              {t("addElementDialog.addressComplete.country")}
            </Label>
            <input
              type="text"
              id={`${name}-country`}
              name={`${name}-country`}
              value={addressObject.country}
              onChange={(e) => setAddressObject((prev) => ({ ...prev, country: e.target.value }))}
              className={cn("gc-input-text", meta.error && "gc-error-input")}
              required={required}
              data-testid="addresscomplete-input-country"
            />
          </div>
        )}
      </fieldset>
    </>
  );
};