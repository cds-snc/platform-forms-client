"use client";
import React from "react";
import { useField } from "formik";
import { ChoiceFieldProps, InputFieldProps } from "@lib/types";
import { MultipleChoiceGroupElement } from "./MultipleChoiceGroupElement";

interface MultipleChoiceGroupProps extends InputFieldProps {
  choicesProps: Array<ChoiceFieldProps>;
  type: "checkbox" | "radio";
  error?: string;
}

export const MultipleChoiceGroup = (props: MultipleChoiceGroupProps): React.ReactElement => {
  const { className, choicesProps, type, error } = props;
  const [field, meta] = useField(props);

  const validationError = meta.error || error;

  return (
    <MultipleChoiceGroupElement
      name={field.name}
      className={className}
      choicesProps={choicesProps}
      type={type}
      validationError={validationError}
    />
  );
};
