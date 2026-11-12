"use client";
import React, { type JSX } from "react";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps, HTMLTextInputTypeAttribute } from "@lib/types";
import { cn } from "@lib/utils";
import { useCharacterCount } from "@lib/hooks/useCharacterCount";
import { getErrorMessageId } from "@lib/a11yHelpers";

export interface TextInputProps extends InputFieldProps {
  type: Exclude<HTMLTextInputTypeAttribute, "number">;
  placeholder?: string;
  spellCheck?: boolean;
}

export const TextInput = (
  props: TextInputProps & JSX.IntrinsicElements["input"]
): React.ReactElement => {
  const {
    id,
    type,
    className,
    required,
    ariaDescribedBy,
    placeholder,
    autoComplete,
    maxLength,
    spellCheck,
    lang,
  } = props;
  const [field, meta, helpers] = useField(props);

  const { updateCharacterError, hasCharacterError, ariaDescribedByIds, CharacterCountDisplay } =
    useCharacterCount({
      maxLength,
      id: id ?? "",
      lang,
      value: field.value,
      error: meta.error,
      setError: helpers.setError,
    });

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    helpers.setValue(event.target.value);
    updateCharacterError(event.target.value);
  };

  const classes = cn("gcds-input-text", className, meta.error && "gcds-error");
  const errorMessageId = getErrorMessageId(id);

  return (
    <>
      <div aria-live={hasCharacterError ? "polite" : undefined}>
        {meta.error && <ErrorMessage id={errorMessageId}>{meta.error}</ErrorMessage>}
      </div>
      <input
        data-testid="textInput"
        className={classes}
        id={id}
        type={type}
        key={id}
        spellCheck={spellCheck}
        aria-required={required ? "true" : undefined}
        aria-invalid={meta.error ? "true" : undefined}
        autoComplete={autoComplete ? autoComplete : "off"}
        placeholder={placeholder}
        {...ariaDescribedByIds(!!meta.error, ariaDescribedBy)}
        {...field}
        onChange={handleTextInputChange}
      />
      <CharacterCountDisplay />
    </>
  );
};
