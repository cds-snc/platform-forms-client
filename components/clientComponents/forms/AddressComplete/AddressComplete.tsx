"use client";
import {
  AddressCompleteChoice,
  AddressCompleteProps,
  AddressElements,
  AddressCompleNext,
} from "./types";
import {
  getAddressCompleteChoices,
  getSelectedAddress,
  getAddressCompleteRetrieve,
  matchesAddressPattern,
} from "./utils";
import { Description, Label, ManagedCombobox } from "@clientComponents/forms";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@i18n/client";
import { useField } from "formik";
import { cn } from "@lib/utils";
import { SpinnerIcon } from "@serverComponents/icons/SpinnerIcon";
import { Language } from "@lib/types/form-builder-types";
import { countries } from "@lib/managedData/countries";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";

interface ManagedComboboxRef {
  changeInputValue: (value: string, keepOpen: boolean) => void;
}

export const AddressComplete = (props: AddressCompleteProps): React.ReactElement => {
  const { id, name, required, ariaDescribedBy, label, lang } = props;

  const [field, meta, helpers] = useField(props);

  const { t, i18n } = useTranslation("form-builder", { lng: lang });

  //Address Complete elements
  const [choices, setChoices] = useState<string[]>([]);
  const [addressResultCache, setAddressResultCache] = useState<AddressCompleteChoice[]>([]); // Cache the results from the address search.

  // Cache and Allow values
  const [isReady, setIsReady] = useState(false);
  const [allow, setAllow] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const toFullAddress = (address: AddressCompleteChoice): string => {
    return address.Text + ", " + address.Description;
  };

  const comboboxRef = useRef<ManagedComboboxRef>(null);

  // Check if addressComplete is allowed.
  const { getFlag } = useFeatureFlags();
  const featureFlags = {
    addressComplete: getFlag("addressComplete"),
  };
  useEffect(() => {
    const checkAllowed = async () => {
      if (featureFlags.addressComplete) {
        setAllow(true);
        setApiKey(process.env.NEXT_PUBLIC_ADDRESSCOMPLETE_API_KEY || "");
      } else {
        setApiKey("");
      }

      setIsReady(true);
    };

    if (apiKey === "") {
      // Don't recheck.
      checkAllowed();
    }
  }, [apiKey, featureFlags.addressComplete]);

  //Form fillers address elements
  const [addressObject, setAddressObject] = useState<AddressElements>(
    field.value
      ? JSON.parse(field.value)
      : {
          streetAddress: "",
          city: "",
          province: "",
          postalCode: "",
          // Make sure the initial default is CAN to avoid null cases when:
          // - the address is "Canada only"
          // - the address is not "Canada only" and the country drop down was not interacted with
          country: "CAN",
        }
  );

  // Update the field value when the address object changes
  useEffect(() => {
    const newValue = addressObject ? JSON.stringify(addressObject) : "";
    helpers.setValue(newValue);
  }, [addressObject, helpers]);

  const handleAddressComplete = async (choices: AddressCompleteChoice[]) => {
    //loop through the responseData and add it to the addressResultsCache
    const newElements: AddressCompleteChoice[] = [];

    for (let i = 0; i < choices.length; i++) {
      // Check key doesn't already exist.
      if (!addressResultCache.find((item: AddressCompleteChoice) => item.Id === choices[i].Id)) {
        newElements.push(choices[i]);
      }
    }

    if (newElements.length > 0) {
      setAddressResultCache((prevCache) => [...prevCache, ...newElements]);
    }

    // Filter the results to avoid duplicate entry
    const uniqueResults = choices.filter(
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

  const onAddressSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressData("streetAddress", e.target.value); // Update the street address in the address object
    // It will be updated again when the address is set to a autocomplete value, or kept if no value is selected.

    if (!allow) {
      return;
    } // Abandon if addressComplete is disabled.

    const query = e.target.value;

    if (matchesAddressPattern(query)) {
      await onAddressSet(query); // Do Search for Nested Address via ID instead of Query.
      return;
    } // Abandon, don't search on nested addresses.

    const responseData = await getAddressCompleteChoices(
      apiKey,
      query,
      addressObject?.country || "CAN"
    );

    handleAddressComplete(responseData);
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
      // Perform regex test against the selectedResult.Next value.
      // The API just sometimes gives back a "Retrieve" value for a nested address.
      // Why? Because Reasons I guess.
      // eg: Toronto, ON - 15489 Addresses
      // Swap the value to Find
      let nextValue = selectedResult.Next;
      if (matchesAddressPattern(selectedResult.Next)) {
        nextValue = AddressCompleNext.Find;
      }

      // Handle the Next value.
      if (nextValue == AddressCompleNext.Retrieve) {
        const responseData = await getSelectedAddress(
          apiKey,
          selectedResult.Id,
          addressObject?.country || "CAN",
          i18n.language as Language
        );
        if (responseData) {
          const results = responseData;
          setAddressObject(results);
          if (comboboxRef.current) {
            comboboxRef.current.changeInputValue(results.streetAddress, false);
          }
        }
      } else if (nextValue == AddressCompleNext.Find) {
        // Do another lookup for the address.
        const responseData = await getAddressCompleteRetrieve(
          apiKey,
          selectedResult.Id,
          addressObject?.country || "CAN"
        );

        if (comboboxRef.current) {
          comboboxRef.current.changeInputValue("", true);
        }

        handleAddressComplete(responseData);
      }
    }
  };

  const setAddressData = (key: string, value: string) => {
    let baseAddressObject = {};

    if (addressObject === null) {
      baseAddressObject = {
        streetAddress: "",
        city: "",
        province: "",
        postalCode: "",
        country: "CAN",
      };
    } else {
      baseAddressObject = addressObject;
    }

    for (const internalKey in baseAddressObject) {
      if (key === internalKey) {
        const newAddressObject = { ...baseAddressObject, [key]: value };
        setAddressObject(newAddressObject as AddressElements);
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
      // Reset the addressObject
      setAddressObject({
        streetAddress: "",
        city: "",
        province: "",
        postalCode: "",
        country: country.id,
      });
      if (comboboxRef.current) {
        comboboxRef.current.changeInputValue("", false);
      }
      setAddressResultCache([]); // Clear the cache.
    }
  };

  return (
    <>
      <fieldset
        role="group"
        className="gcds-fieldset"
        aria-describedby={ariaDescribedBy ? `desc-${id}` : undefined}
        data-testid="addressComplete"
        id={id}
        tabIndex={0}
      >
        <legend key={`label-${id}`} id={`label-${id}`} className={"legend-fieldset"}>
          {label}
        </legend>

        {ariaDescribedBy && <Description id={`${id}`}>{ariaDescribedBy}</Description>}

        {props.canadianOnly && (
          <div>
            <input type="hidden" id={`${name}-country`} name={`${name}-country`} value={"CAN"} />
          </div>
        )}
        {!props.canadianOnly && (
          <div className="mb-6 mt-4">
            <Label
              htmlFor={`${name}-country`}
              className={props.required ? "gc-label required" : "gc-label"}
              required={props.required}
              lang={lang}
            >
              {t("addElementDialog.addressComplete.country")}
            </Label>
            <ManagedCombobox
              id={`${name}-country`}
              name={`${name}-country`}
              choices={countryChoices}
              onSetValue={(val) => setCountry(val)}
              className={cn(meta.error && "gc-error-input")}
              required={props.required}
              baseValue="Canada"
              useFilter={true}
              data-testid="addresscomplete-input-country"
            />
          </div>
        )}

        <div className="mb-6">
          <Label
            htmlFor={`${name}-streetAddress`}
            className={props.required ? "gc-label required" : "gc-label"}
            required={props.required}
            lang={lang}
          >
            {t("addElementDialog.addressComplete.street.label")}
          </Label>
          <Description id={`${name}-streetDesc`}>
            {t("addElementDialog.addressComplete.street.description")}
          </Description>
          {isReady && (
            <ManagedCombobox
              ref={comboboxRef}
              choices={choices}
              key={`${name}-streetAddress`}
              id={`${name}-streetAddress`}
              name={`${name}-streetAddress`}
              onChange={onAddressSearch}
              onSetValue={onAddressSet}
              baseValue={addressObject.streetAddress}
              required={props.required}
              placeholderText={allow ? t("addElementDialog.addressComplete.startTyping") : ""}
              ariaDescribedBy={`${name}-streetDesc`}
            />
          )}
          {!isReady && (
            <>
              <div role="status" className="mt-2">
                <SpinnerIcon className="size-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600" />
                <span className="sr-only">{t("loading")}</span>
              </div>
            </>
          )}
          <input type="hidden" {...field} />
        </div>

        <div className="mb-6">
          <Label htmlFor={`${name}-city`} className="gc-label">
            {t("addElementDialog.addressComplete.city")}
          </Label>
          <input
            type="text"
            id={`${name}-city`}
            name={`${name}-city`}
            value={addressObject.city}
            onChange={(e) => setAddressData("city", e.target.value)}
            className={cn("gc-input-text", meta.error && "gc-error-input")}
            required={props.required}
            data-testid="addresscomplete-input-city"
          />
        </div>

        <div className="mb-6">
          <Label htmlFor={`${name}-province`} className="gc-label">
            {props.canadianOnly && t("addElementDialog.addressComplete.components.province")}
            {!props.canadianOnly &&
              t("addElementDialog.addressComplete.components.provinceOrState")}
          </Label>
          <input
            type="text"
            id={`${name}-province`}
            name={`${name}-province`}
            value={addressObject.province}
            onChange={(e) => setAddressData("province", e.target.value)}
            className={cn("gc-input-text", meta.error && "gc-error-input")}
            required={required}
            data-testid="addresscomplete-input-province"
          />
        </div>

        <div className="mb-6">
          <Label htmlFor={`${name}-postal`} className="gc-label">
            {props.canadianOnly && t("addElementDialog.addressComplete.components.postalCode")}
            {!props.canadianOnly &&
              t("addElementDialog.addressComplete.components.postalCodeOrZip")}
          </Label>
          <input
            id={`${name}-postal`}
            type="text"
            name={`${name}-postal`}
            value={addressObject.postalCode}
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
