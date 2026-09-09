"use client";
import React, { useState } from "react";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import { cn } from "@lib/utils";
import {
  langToLocale,
  getNumberFormatOptions,
  normalizeLocaleInput,
  isNumericInput,
  isIntegerInput,
  formatNumericStringForDisplay,
} from "./utils";

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

  const formatOptions = getNumberFormatOptions({ currencyCode, stepCount, useThousandsSeparator });
  const formatKey = `${locale}:${currencyCode ?? ""}:${stepCount ?? ""}:${useThousandsSeparator ?? ""}`;

  // The display value shown in the input (locale-formatted).
  // Formik holds the raw numeric string (e.g. "123.45") for DB storage.
  const [inputValue, setInputValue] = useState(() => {
    return field.value
      ? formatNumericStringForDisplay(String(field.value), locale, formatOptions)
      : (field.value ?? "");
  });

  // When locale or format options change, reformat the display from the stable Formik number.
  const [prevFormatKey, setPrevFormatKey] = useState(formatKey);
  if (prevFormatKey !== formatKey) {
    if (field.value !== undefined && field.value !== "") {
      setInputValue(formatNumericStringForDisplay(String(field.value), locale, formatOptions));
    }
    setPrevFormatKey(formatKey);
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

    if (isNumericInput(normalized)) {
      helpers.setValue(normalized);
    }
  };

  const allowedKeys = new Set(BASE_ALLOWED_KEYS);
  if (allowNegativeNumbers) allowedKeys.add("-");
  if (currencyCode) allowedKeys.add("$");
  if (currencyCode || (stepCount && stepCount > 0)) {
    allowedKeys.add(".");
    allowedKeys.add(",");
  }

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

    const rawValue = normalizeLocaleInput(inputValue, locale);
    if (rawValue === "" || !isNumericInput(rawValue)) {
      setInputValue(rawValue);
      return;
    }

    const rawNumber = isIntegerInput(rawValue) ? String(BigInt(rawValue)) : rawValue;

    // Store the clean number in Formik (for DB)
    helpers.setValue(rawNumber);
    // Show the formatted version in the input
    setInputValue(formatNumericStringForDisplay(rawNumber, locale, formatOptions));
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
