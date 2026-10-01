"use client";
import React from "react";
import { useField } from "formik";
import { ErrorMessage, Checkbox, Radio } from "@clientComponents/forms";
import { ChoiceFieldProps, InputFieldProps } from "@lib/types";
import { getDescribedByIds, getErrorMessageId } from "@lib/a11yHelpers";

interface MultipleChoiceGroupProps extends InputFieldProps {
  choicesProps: Array<ChoiceFieldProps>;
  type: "checkbox" | "radio";
}

export const MultipleChoiceGroup = (props: MultipleChoiceGroupProps): React.ReactElement => {
  const { ariaDescribedBy, className, choicesProps, type } = props;

  // field contains name, value, onChange, and other required Form attributes.
  const [field, meta] = useField(props);
  const errorMessageId = meta.error ? getErrorMessageId(field.name) : undefined;

  const choices = choicesProps.map((choice, index) => {
    const firstChoiceDescription =
      index === 0 ? getDescribedByIds(errorMessageId, ariaDescribedBy) : undefined;
    return type == "checkbox" ? (
      <Checkbox
        {...choice}
        key={index}
        name={field.name}
        className={className}
        aria-describedby={firstChoiceDescription}
      />
    ) : (
      <Radio
        {...choice}
        key={index}
        name={field.name}
        className={className}
        aria-describedby={firstChoiceDescription}
      />
    );
  });

  // map checkboxes
  return (
    <>
      {meta.error && <ErrorMessage id={errorMessageId}>{meta.error}</ErrorMessage>}
      {choices}
    </>
  );
};
