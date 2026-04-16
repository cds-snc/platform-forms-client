"use client";
import React, { useCallback, useMemo, useRef, useState, type JSX } from "react";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";

export interface NumberInputProps extends InputFieldProps {
  placeholder?: string;
  allowNegativeNumbers?: boolean;
  stepCount?: number;
  maxLength?: number;
  currencyCode?: string;
  numberMin?: number;
  numberMax?: number;
}

const langToLocale = (lang?: string) => (lang === "fr" ? "fr-CA" : "en-CA");

export const NumberInput = (
  props: NumberInputProps & JSX.IntrinsicElements["input"]
): React.ReactElement => {
  const {
    id,
    className,
    required,
    ariaDescribedBy,
    placeholder,
    allowNegativeNumbers,
    stepCount,
    currencyCode,
    lang,
  } = props;
  const [field, meta, helpers] = useField(props);
  const { i18n } = useTranslation("common", { lng: lang });
  const inputRef = useRef<HTMLInputElement>(null);

  const locale = langToLocale(lang);

  const formatOptions = useMemo<Intl.NumberFormatOptions>(
    () =>
      currencyCode
        ? { style: "currency", currency: currencyCode, useGrouping: true }
        : {
            minimumFractionDigits: stepCount ?? 0,
            maximumFractionDigits: stepCount ?? 0,
            useGrouping: true,
          },
    [stepCount, currencyCode]
  );

  // Format a raw number into a locale-aware display string
  const formatForDisplay = useCallback(
    (value: number) => {
      if (Number.isNaN(value)) return "";
      return new Intl.NumberFormat(locale, formatOptions).format(value);
    },
    [locale, formatOptions]
  );

  // The display value shown in the input (locale-formatted).
  // Formik holds the raw numeric string (e.g. "123.45") for DB storage.
  const [inputValue, setInputValue] = useState(() => {
    const num = Number(field.value);
    return field.value && !Number.isNaN(num) ? formatForDisplay(num) : (field.value ?? "");
  });

  // When locale or format options change, reformat the display from the stable Formik number
  const [prevLocale, setPrevLocale] = useState(locale);
  const [prevFormatOptions, setPrevFormatOptions] = useState(formatOptions);
  if (locale !== prevLocale || formatOptions !== prevFormatOptions) {
    const num = Number(field.value);
    if (field.value !== undefined && field.value !== "" && !Number.isNaN(num)) {
      setInputValue(new Intl.NumberFormat(locale, formatOptions).format(num));
    }
    setPrevLocale(locale);
    setPrevFormatOptions(formatOptions);
  }

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setInputValue(raw);

    // Allow intermediate states while typing
    if (raw === "" || raw === "-" || raw === "." || raw === "-.") {
      helpers.setValue(raw === "" ? "" : raw);
      return;
    }

    const value = Number(raw);
    if (!Number.isNaN(value)) {
      helpers.setValue(String(value));
    }
  };

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      ".",
      ",",
    ];

    if (allowNegativeNumbers) {
      allowedKeys.push("-");
    }

    if (currencyCode) {
      allowedKeys.push("$");
    }

    const isDigit = event.key >= "0" && event.key <= "9";
    const isAllowedKey = allowedKeys.includes(event.key);
    const isModifier = event.ctrlKey || event.metaKey;

    if (!isDigit && !isAllowedKey && !isModifier) {
      event.preventDefault();
    }
  };

  const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    field.onBlur(event);

    const num = Number(field.value);
    if (field.value === "" || Number.isNaN(num)) {
      setInputValue(field.value ?? "");
      return;
    }

    // Store the clean number in Formik (for DB)
    helpers.setValue(String(num));
    // Show the formatted version in the input
    setInputValue(formatForDisplay(num));
  };

  const classes = cn("gcds-input-text", className, meta.error && "gcds-error");

  return (
    <>
      {meta.error && <ErrorMessage id={"errorMessage" + id}>{meta.error}</ErrorMessage>}
      <input
        ref={inputRef}
        data-testid="numberInput"
        className={classes}
        id={id}
        placeholder={placeholder}
        {...(ariaDescribedBy && { "aria-describedby": ariaDescribedBy })}
        name={field.name}
        value={inputValue}
        key={`${id}-${i18n.language}`}
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
        onBlur={handleOnBlur}
        required={required}
      />
    </>
  );
};
