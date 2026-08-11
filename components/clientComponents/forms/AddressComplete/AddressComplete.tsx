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
} from "./actions";
import {
  localizeAddressCompleteDescription,
  matchesAddressPattern,
  getCountryCodeFromName,
  getCountryNameFromCode,
} from "./utils";
import { Description, Label, ManagedCombobox, ErrorMessage } from "@clientComponents/forms";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import debounce from "lodash/debounce";
import { useTranslation } from "@i18n/client";
import { useField } from "formik";
import { cn } from "@lib/utils";
import { Language } from "@lib/types/form-builder-types";
import { countries } from "@lib/managedData/countries";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { isValidAddressSubFieldInvalid, getAddressSubFieldError } from "@gcforms/core";
import {
  MAX_SEARCH_QUERY_LENGTH,
  MAX_ADDRESS_FIELD_LENGTH,
  MAX_POSTAL_CODE_LENGTH,
  normalizeAddressField,
  normalizePostalCode,
} from "./utils";

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

  // Memoize addressLabels and toFullAddress so callbacks can be stable
  const addressLabelsMemo = useMemo(
    () => ({
      en: t("addElementDialog.addressComplete.multipleAddresses", { lng: "en" }),
      fr: t("addElementDialog.addressComplete.multipleAddresses", { lng: "fr" }),
      current: t("addElementDialog.addressComplete.multipleAddresses"),
    }),
    [t]
  );

  const toFullAddress = useCallback(
    (address: AddressCompleteChoice) =>
      address.Text +
      ", " +
      localizeAddressCompleteDescription(address.Description, addressLabelsMemo),
    [addressLabelsMemo]
  );

  const comboboxRef = useRef<ManagedComboboxRef>(null);
  const [apiError, setApiError] = useState(false);

  const countryError = getAddressSubFieldError(meta.error, "country");
  const streetError = getAddressSubFieldError(meta.error, "streetAddress");
  const cityError = getAddressSubFieldError(meta.error, "city");
  const provinceError = getAddressSubFieldError(meta.error, "province");
  const postalError = getAddressSubFieldError(meta.error, "postalCode");

  // Check if addressComplete is allowed.
  const { getFlag } = useFeatureFlags();
  const featureFlags = {
    addressComplete: getFlag("addressComplete"),
  };

  const isNoAuthPreviewMode = useMemo(() => window.location.href.includes("0000/preview"), []);

  const allowAddressComplete = featureFlags.addressComplete && !isNoAuthPreviewMode;

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
          country: "Canada",
        }
  );

  // Update the field value when the address object changes
  useEffect(() => {
    const newValue = addressObject ? JSON.stringify(addressObject) : "";
    helpers.setValue(newValue);
  }, [addressObject, helpers]);

  // Keep a ref to the latest addressObject so the debounced function can read current values
  const addressObjectRef = useRef<AddressElements | null>(addressObject);
  useEffect(() => {
    addressObjectRef.current = addressObject;
  }, [addressObject]);

  // Debounced search ref will be initialized after handleAddressComplete is defined
  const debouncedSearchRef = useRef<(((q: string) => void) & { cancel?: () => void }) | null>(null);

  const handleAddressComplete = useCallback(
    async (choices: AddressCompleteChoice[]) => {
      // Add new results to the cache using functional update to avoid stale reads
      setAddressResultCache((prevCache) => {
        const newElements = choices.filter((c) => !prevCache.find((p) => p.Id === c.Id));
        return newElements.length > 0 ? [...prevCache, ...newElements] : prevCache;
      });

      // Filter the results to avoid duplicate entry
      const uniqueResults = choices.filter(
        (item: AddressCompleteChoice, index: number, self: AddressCompleteChoice[]) =>
          index ===
          self.findIndex((t) => toFullAddress(t) === toFullAddress(item) && item.Text !== undefined)
      );

      setChoices(uniqueResults.map((item: AddressCompleteChoice) => toFullAddress(item)));
    },
    [setAddressResultCache, setChoices, toFullAddress]
  );

  const onAddressSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressData("streetAddress", e.target.value); // Update the street address in the address object
    // It will be updated again when the address is set to a autocomplete value, or kept if no value is selected.

    if (!allowAddressComplete) {
      return;
    } // Abandon if addressComplete is disabled.

    const query = e.target.value;

    if (matchesAddressPattern(query)) {
      await onAddressSet(query); // Do Search for Nested Address via ID instead of Query.
      return;
    } // Abandon, don't search on nested addresses.

    // Debounced search to avoid calling the API on every keystroke
    debouncedSearchRef.current?.(query);
    return;
  };

  const onAddressSet = async (value: string) => {
    if (!allowAddressComplete) {
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
        try {
          const response = await getSelectedAddress(
            selectedResult.Id,
            getCountryCodeFromName(addressObject?.country),
            i18n.language as Language
          );
          if (response.error) {
            setApiError(true);
          } else if (response.address) {
            setAddressObject({
              ...response.address,
              country: getCountryNameFromCode(response.address.country, i18n.language as Language),
            });
            if (comboboxRef.current) {
              comboboxRef.current.changeInputValue(response.address.streetAddress, false);
            }
            setApiError(false);
          }
        } catch (err: unknown) {
          setApiError(true);
        }
      } else if (nextValue == AddressCompleNext.Find) {
        // Do another lookup for the address.
        try {
          const response = await getAddressCompleteRetrieve(
            selectedResult.Id,
            getCountryCodeFromName(addressObject?.country),
            i18n.language as Language
          );

          if (response.error) {
            setApiError(true);
            setChoices([]);
          } else {
            if (comboboxRef.current) {
              comboboxRef.current.changeInputValue("", true);
            }

            handleAddressComplete(response.items);
            setApiError(false);
          }
        } catch (err: unknown) {
          setApiError(true);
          setChoices([]);
        }
      }
    }
  };

  // Initialize debounced search after handler is defined, and recreate when language or handler changes
  useEffect(() => {
    debouncedSearchRef.current = debounce(async (query: string) => {
      try {
        const response = await getAddressCompleteChoices(
          query,
          getCountryCodeFromName(addressObjectRef.current?.country),
          i18n.language as Language
        );
        if (response.error) {
          setApiError(true);
          setChoices([]);
          setAddressResultCache([]);
        } else {
          setApiError(false);
          handleAddressComplete(response.items);
        }
      } catch (err: unknown) {
        setApiError(true);
        setChoices([]);
        setAddressResultCache([]);
      }
    }, 300);

    return () => {
      if (debouncedSearchRef.current && debouncedSearchRef.current.cancel) {
        debouncedSearchRef.current?.cancel();
        debouncedSearchRef.current = null;
      }
    };
  }, [i18n.language, t, handleAddressComplete]);

  const setAddressData = (key: string, value: string) => {
    let baseAddressObject = {};

    if (addressObject === null) {
      baseAddressObject = {
        streetAddress: "",
        city: "",
        province: "",
        postalCode: "",
        country: "Canada",
      };
    } else {
      baseAddressObject = addressObject;
    }

    for (const internalKey in baseAddressObject) {
      if (key === internalKey) {
        const sanitizedValue =
          key === "postalCode" ? normalizePostalCode(value) : normalizeAddressField(value);
        const newAddressObject = { ...baseAddressObject, [key]: sanitizedValue };
        setAddressObject(newAddressObject as AddressElements);
      }
    }
  };

  const countryChoices = countries.all?.map((country) => {
    return country[i18n.language as Language];
  });

  // Determine the localized display value for the current country code or name
  const countryBaseValue = (() => {
    try {
      const stored = addressObject?.country;
      return getCountryNameFromCode(stored, i18n.language as Language);
    } catch (e) {
      // fall through to default
    }
    return "Canada";
  })();

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
        country: country[i18n.language as Language],
      });
      if (comboboxRef.current) {
        comboboxRef.current.changeInputValue("", false);
      }
      setAddressResultCache([]); // Clear the cache.
    }
  };

  const searchHintText = featureFlags.addressComplete
    ? `${t("addElementDialog.addressComplete.startTyping")}.`
    : "";

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
        <legend key={`label-${id}`} id={`label-${id}`} className={"legend-fieldset size-h3"}>
          {label}
        </legend>

        {ariaDescribedBy && <Description id={`${id}`}>{ariaDescribedBy}</Description>}

        {props.canadianOnly && (
          <div>
            <input type="hidden" id={`${name}-country`} name={`${name}-country`} value={"CAN"} />
          </div>
        )}
        {!props.canadianOnly && (
          <div className="mt-4 mb-6">
            <Label
              htmlFor={`${name}-country`}
              id={`label-${name}-country`}
              className={props.required ? "gcds-label required" : "gcds-label"}
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
              className={cn(
                isValidAddressSubFieldInvalid(meta.error, "country") && "gc-error-input"
              )}
              overrideError={countryError}
              required={props.required}
              baseValue={countryBaseValue}
              useFilter={true}
              data-testid="addresscomplete-input-country"
            />
          </div>
        )}

        <div className="mb-6">
          <Label
            htmlFor={`${name}-streetAddress`}
            id={`label-${name}-streetAddress`}
            className={props.required ? "gcds-label required" : "gcds-label"}
            required={props.required}
            lang={lang}
          >
            {t("addElementDialog.addressComplete.street.label")}
          </Label>
          <Description id={`${name}-streetDesc`}>
            {t("addElementDialog.addressComplete.street.description")}
          </Description>
          {getCountryCodeFromName(addressObject.country) === "CAN" ? (
            <>
              {/* If we have an API error don't show search hint text as there will be no auto-complete */}
              {!apiError && <Description id={`${name}-streetDesc-2`}>{searchHintText}</Description>}

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
                ariaDescribedBy={`${name}-streetDesc ${name}-streetDesc-2`}
                maxLength={MAX_SEARCH_QUERY_LENGTH}
                className={cn(
                  isValidAddressSubFieldInvalid(meta.error, "streetAddress") && "gc-error-input"
                )}
                overrideError={streetError}
              />
            </>
          ) : (
            <input
              type="text"
              id={`${name}-streetAddress`}
              name={`${name}-streetAddress`}
              value={addressObject.streetAddress}
              onChange={(e) => setAddressData("streetAddress", e.target.value)}
              maxLength={MAX_ADDRESS_FIELD_LENGTH}
              className={cn(
                "gc-input-text",
                isValidAddressSubFieldInvalid(meta.error, "streetAddress") && "gc-error-input"
              )}
              required={props.required}
              data-testid="addresscomplete-streetAddress-input"
            />
          )}
          <input type="hidden" {...field} />
        </div>

        <div className="mb-6">
          <Label htmlFor={`${name}-city`} className="gcds-label">
            {t("addElementDialog.addressComplete.city")}
          </Label>
          {cityError && (
            <ErrorMessage id={"errorMessage" + `${name}-city`}>{cityError}</ErrorMessage>
          )}
          <input
            type="text"
            id={`${name}-city`}
            name={`${name}-city`}
            value={addressObject.city}
            onChange={(e) => setAddressData("city", e.target.value)}
            maxLength={MAX_ADDRESS_FIELD_LENGTH}
            className={cn(
              "gc-input-text",
              isValidAddressSubFieldInvalid(meta.error, "city") && "gc-error-input"
            )}
            required={props.required}
            data-testid="addresscomplete-input-city"
          />
        </div>

        <div className="mb-6">
          <Label htmlFor={`${name}-province`} className="gcds-label">
            {props.canadianOnly && t("addElementDialog.addressComplete.components.province")}
            {!props.canadianOnly &&
              t("addElementDialog.addressComplete.components.provinceOrState")}
          </Label>
          {provinceError && (
            <ErrorMessage id={"errorMessage" + `${name}-province`}>{provinceError}</ErrorMessage>
          )}
          <input
            type="text"
            id={`${name}-province`}
            name={`${name}-province`}
            value={addressObject.province}
            onChange={(e) => setAddressData("province", e.target.value)}
            maxLength={MAX_ADDRESS_FIELD_LENGTH}
            className={cn(
              "gc-input-text",
              isValidAddressSubFieldInvalid(meta.error, "province") && "gc-error-input"
            )}
            required={required}
            data-testid="addresscomplete-input-province"
          />
        </div>

        <div className="mb-6">
          <Label htmlFor={`${name}-postal`} className="gcds-label">
            {props.canadianOnly && t("addElementDialog.addressComplete.components.postalCode")}
            {!props.canadianOnly &&
              t("addElementDialog.addressComplete.components.postalCodeOrZip")}
          </Label>
          {postalError && (
            <ErrorMessage id={"errorMessage" + `${name}-postal`}>{postalError}</ErrorMessage>
          )}
          <input
            id={`${name}-postal`}
            type="text"
            name={`${name}-postal`}
            value={addressObject.postalCode}
            onChange={(e) => setAddressData("postalCode", e.target.value)}
            maxLength={MAX_POSTAL_CODE_LENGTH}
            className={cn(
              "gc-input-text",
              isValidAddressSubFieldInvalid(meta.error, "postalCode") && "gc-error-input"
            )}
            required={required}
            data-testid="addresscomplete-input-postalCode"
          />
        </div>
      </fieldset>
    </>
  );
};
