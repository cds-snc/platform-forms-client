"use client";
import React, { useCallback, useMemo, useRef, type JSX } from "react";
import { useField } from "formik";
import { useNumberField } from "react-aria";
import { useNumberFieldState } from "@react-stately/numberfield";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";
import { useCharacterCount } from "@lib/hooks/useCharacterCount";

export interface NumberInputProps extends InputFieldProps {
  placeholder?: string;
  allowNegativeNumbers?: boolean;
  stepCount?: number;
  maxLength?: number;
  currencyCode?: string;
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
    maxLength,
    allowNegativeNumbers,
    stepCount,
    currencyCode,
    lang,
  } = props;
  const [field, meta, helpers] = useField(props);
  const { i18n } = useTranslation("common", { lng: lang });
  const inputRef = useRef<HTMLInputElement>(null);

  const { setRemainingCharacters, ariaDescribedByIds, CharacterCountDisplay } = useCharacterCount({
    maxLength,
    id: id ?? "",
    lang,
  });

  const locale = langToLocale(lang);

  const numericValue = field.value !== undefined && field.value !== "" ? Number(field.value) : NaN;

  const formatOptions = useMemo<Intl.NumberFormatOptions>(
    () =>
      currencyCode
        ? {
            style: "currency",
            currency: currencyCode,
            useGrouping: false,
          }
        : {
            maximumFractionDigits: stepCount ?? 0,
            useGrouping: false,
          },
    [stepCount, currencyCode]
  );

  const onChange = useCallback(
    (value: number) => {
      if (Number.isNaN(value)) {
        helpers.setValue("");
      } else {
        helpers.setValue(String(value));
      }

      if (maxLength) {
        const strLength = Number.isNaN(value) ? 0 : String(value).length;
        setRemainingCharacters(maxLength - strLength);
      }
    },
    [helpers, maxLength, setRemainingCharacters]
  );

  const numberFieldProps = {
    locale,
    minValue: allowNegativeNumbers ? undefined : 0,
    formatOptions,
    value: Number.isNaN(numericValue) ? undefined : numericValue,
    onChange,
    isRequired: required,
  };

  const state = useNumberFieldState(numberFieldProps);
  const { inputProps } = useNumberField(numberFieldProps, state, inputRef);

  const classes = cn("gcds-input-text", className, meta.error && "gcds-error");

  return (
    <>
      {meta.error && <ErrorMessage id={"errorMessage" + id}>{meta.error}</ErrorMessage>}
      <input
        {...inputProps}
        ref={inputRef}
        data-testid="numberInput"
        className={classes}
        id={id}
        placeholder={placeholder}
        {...ariaDescribedByIds(!!meta.error, ariaDescribedBy)}
        key={`${id}-${i18n.language}`}
        aria-describedby={`${id}-description-number`}
      />
      <CharacterCountDisplay />
    </>
  );
};
