import React from "react";
import { Field, useField } from "formik";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Checkbox from "../Checkbox/Checkbox";
import Radio from "../Radio/Radio";
import { MultipleChoiceProps } from "../../../lib/types";

interface MultipleChoiceGroupProps {
  className?: string;
  choicesProps: Array<MultipleChoiceProps>;
  name: string;
  type: "checkbox" | "radio";
  ariaDescribedBy?: string;
}

export const MultipleChoiceGroup = (props: MultipleChoiceGroupProps): React.ReactElement => {
  const { className, choicesProps, name, type, ariaDescribedBy } = props;

  // field contains name, value, onChange, and other required Form attributes.
  const [field, meta] = useField(props);

  const choices = choicesProps.map((choice, index) => {
    return type == "checkbox" ? (
      <Checkbox
        {...choice}
        key={index}
        name={field.name}
        className={className}
        ariaDescribedBy={ariaDescribedBy}
      ></Checkbox>
    ) : (
      <Radio
        {...choice}
        key={index}
        name={field.name}
        className={className}
        ariaDescribedBy={ariaDescribedBy}
      ></Radio>
    );
  });

  // map checkboxes
  return (
    <Field component="div" data-testid={type} name={name}>
      {meta.error ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
      {choices}
    </Field>
  );
};

export default MultipleChoiceGroup;
