"use client";
import React, { type JSX } from "react";
import { useField } from "formik";
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
}

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
    lang,
  } = props;
  const [field, meta, helpers] = useField(props);
  const { t, i18n } = useTranslation("common", { lng: lang });

  const { setRemainingCharacters, ariaDescribedByIds, CharacterCountDisplay } = useCharacterCount({
    maxLength,
    id: id ?? "",
    lang,
  });

  const decimalSeparator = t("decimalSeparator");

  const handleNumberInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;
    newValue = newValue.replace(decimalSeparator, ".");
    helpers.setValue(newValue);

    if (maxLength) {
      setRemainingCharacters(maxLength - newValue.length);
    }
  };

  const displayValue = field.value
    ? String(field.value).replace(".", decimalSeparator)
    : field.value;

  const classes = cn("gcds-input-text", className, meta.error && "gcds-error");

  const checkNumericValues = (key: string, currentTarget: EventTarget & HTMLInputElement) => {
    const { value, selectionStart, selectionEnd } = currentTarget;
    const start = selectionStart ?? 0;
    const end = selectionEnd ?? 0;

    const futureValue = value.slice(0, start) + key + value.slice(end);

    const negativePattern = allowNegativeNumbers ? "-?" : "";

    const escapedSeparator = decimalSeparator === "." ? "\\." : decimalSeparator;
    const decimalPattern =
      stepCount && stepCount > 0 ? `(${escapedSeparator}\\d{0,${stepCount}})?` : "";

    const regex = new RegExp(`^${negativePattern}\\d*${decimalPattern}$`);

    if (!regex.test(futureValue)) {
      return false;
    }
  };

  return (
    <>
      {meta.error && <ErrorMessage id={"errorMessage" + id}>{meta.error}</ErrorMessage>}
      <input
        data-testid="numberInput"
        className={classes}
        id={id}
        type="text"
        required={required}
        placeholder={placeholder}
        {...ariaDescribedByIds(!!meta.error, ariaDescribedBy)}
        {...field}
        onChange={handleNumberInputChange}
        key={`${id}-${i18n.language}`}
        value={displayValue}
        inputMode="numeric"
        aria-describedby={`${id}-description-number`}
        onKeyDown={(e) => {
          if (
            e.key.includes("Arrow") ||
            e.key === "Backspace" ||
            e.key === "Enter" ||
            e.key === "Shift" ||
            e.key === "Tab"
          ) {
            return;
          }

          if (checkNumericValues(e.key, e.currentTarget) === false) {
            e.preventDefault();
          }
        }}
      />
      <CharacterCountDisplay />
    </>
  );
};
