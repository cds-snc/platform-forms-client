"use client";
import React, { type JSX } from "react";
import { useField } from "formik";
import { InputFieldProps, HTMLTextInputTypeAttribute } from "@lib/types";
import { TextInputElement } from "./TextInputElement";

export interface TextInputProps extends InputFieldProps {
  type: HTMLTextInputTypeAttribute;
  placeholder?: string;
  spellCheck?: boolean;
}

// Formik Input wrapper
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
  } = props;
  const [field, meta, helpers] = useField(props);
  const validationError = meta.error;

  return (
    <TextInputElement
      id={id}
      type={type}
      className={className}
      required={required}
      ariaDescribedBy={ariaDescribedBy}
      placeholder={placeholder}
      autoComplete={autoComplete}
      maxLength={maxLength}
      spellCheck={spellCheck}
      validationError={validationError}
      helpers={helpers}
      {...field}
    />
  );
};
