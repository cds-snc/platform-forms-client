"use client";
import React, { useCallback, useMemo, useState } from "react";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import { cn } from "@lib/utils";
import { langToLocale, getNumberFormatOptions, normalizeLocaleInput } from "./utils";

export interface NumberInputProps extends InputFieldProps {
  placeholder?: string;
  allowNegativeNumbers?: boolean;
  stepCount?: number;
  currencyCode?: string;
  useThousandsSeparator?: boolean;
  minValue?: number;
  maxValue?: number;
  minDigits?: number;
  maxDigits?: number;
  lang?: string;
}

const BASE_ALLOWED_KEYS = [
  "Backspace",
  "Delete",
  "Tab",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
];

export const NumberInput = (props: NumberInputProps): React.ReactElement => {
  const {
    id,
    className,
    required,
    ariaDescribedBy,
    placeholder,
    allowNegativeNumbers,
    stepCount,
    currencyCode,
    useThousandsSeparator,
    lang,
  } = props;

  const [field, meta, helpers] = useField(props);

  const locale = langToLocale(lang);

  const formatOptions = useMemo<Intl.NumberFormatOptions>(
    () => getNumberFormatOptions({ currencyCode, stepCount, useThousandsSeparator }),
    [stepCount, currencyCode, useThousandsSeparator]
  );

  // Format a numeric value into a locale-aware display string
  const formatForDisplay = useCallback(
    (value: number | bigint) => {
      if (typeof value === "number" && Number.isNaN(value)) return "";
      return new Intl.NumberFormat(locale, formatOptions).format(value);
    },
    [locale, formatOptions]
  );

  const formatRawValue = useCallback(
    (value: string) => {
      if (value === "") return "";

      const numericValue = /^-?\d+$/.test(value) ? BigInt(value) : Number(value);
      return typeof numericValue === "number" && Number.isNaN(numericValue)
        ? value
        : formatForDisplay(numericValue);
    },
    [formatForDisplay]
  );

  // The display value shown in the input (locale-formatted).
  // Formik holds the raw numeric string (e.g. "123.45") for DB storage.
  const [inputValue, setInputValue] = useState(() => {
    const value = field.value == null ? "" : String(field.value);
    return formatRawValue(value);
  });

  // When locale or format options change, reformat the display from the stable Formik number.
  // formatOptions identity is stable across renders thanks to useMemo above.
  const [prevFormat, setPrevFormat] = useState({ locale, formatOptions });
  if (prevFormat.locale !== locale || prevFormat.formatOptions !== formatOptions) {
    if (field.value != null && field.value !== "") {
      setInputValue(formatRawValue(String(field.value)));
    }
    setPrevFormat({ locale, formatOptions });
  }

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setInputValue(raw);

    // Normalize locale-specific formatting (grouping separators, locale decimal,
    // currency symbols) so that Number() can parse the result reliably.
    const normalized = normalizeLocaleInput(raw, locale);

    // Allow incomplete intermediate states while typing
    if (normalized === "" || normalized === "-" || normalized === "." || normalized === "-.") {
      helpers.setValue(normalized);
      return;
    }

    if (!Number.isNaN(Number(normalized))) {
      helpers.setValue(normalized);
    }
  };

  const allowedKeys = useMemo(() => {
    const keys = new Set(BASE_ALLOWED_KEYS);
    if (allowNegativeNumbers) keys.add("-");
    if (currencyCode) keys.add("$");
    if (currencyCode || (stepCount && stepCount > 0)) {
      keys.add(".");
      keys.add(",");
    }
    return keys;
  }, [allowNegativeNumbers, currencyCode, stepCount]);

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const isDigit = /^\d$/.test(event.key);
    const isAllowedKey = allowedKeys.has(event.key);
    const isModifier = event.ctrlKey || event.metaKey;

    const normalizedInputValue = normalizeLocaleInput(inputValue, locale);

    // Block a second decimal separator if one already exists
    if ((event.key === "." || event.key === ",") && normalizedInputValue.includes(".")) {
      event.preventDefault();
      return;
    }

    if (!isDigit && !isAllowedKey && !isModifier) {
      event.preventDefault();
    }
  };

  const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    field.onBlur(event);

    const value = field.value == null ? "" : String(field.value);
    const normalized = normalizeLocaleInput(value, locale);
    if (normalized === "" || Number.isNaN(Number(normalized))) {
      setInputValue(field.value ?? "");
      return;
    }

    helpers.setValue(normalized);
    // Show the formatted version in the input
    setInputValue(formatRawValue(normalized));
  };

  const classes = cn("gcds-input-text", className, meta.error && "gcds-error");

  const ariaDescribedByValue = [meta.error ? `errorMessage${id}` : null, ariaDescribedBy]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {meta.error && <ErrorMessage id={`errorMessage${id}`}>{meta.error}</ErrorMessage>}
      <input
        data-testid="numberInput"
        className={classes}
        id={id}
        placeholder={placeholder}
        {...(ariaDescribedByValue && { "aria-describedby": ariaDescribedByValue })}
        name={field.name}
        value={inputValue}
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
        onBlur={handleOnBlur}
        required={required}
        inputMode="numeric"
      />
    </>
  );
};
