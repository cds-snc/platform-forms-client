"use client";
import React from "react";
import { useField } from "formik";
import { InputFieldProps } from "@lib/types";
import { BaseTextInput, type BaseTextInputProps } from "./BaseTextInput";

export type TextInputProps = BaseTextInputProps & InputFieldProps;

export const TextInput = (props: TextInputProps): React.ReactElement => {
  const { id, name, type, ...rest } = props;
  const [field, meta] = useField({ name, type });

  return (
    <BaseTextInput
      id={id}
      type={type}
      {...field}
      {...rest}
      error={meta.touched && meta.error ? meta.error : undefined}
    />
  );
};
