import React from "react";
import { useField } from "formik";
import { ErrorMessage, Checkbox, Radio } from "@appComponents/forms";
import { ChoiceFieldProps, InputFieldProps } from "@lib/types";

interface MultipleChoiceGroupProps extends InputFieldProps {
  choicesProps: Array<ChoiceFieldProps>;
  type: "checkbox" | "radio";
}

export const MultipleChoiceGroup = (props: MultipleChoiceGroupProps): React.ReactElement => {
  const { className, choicesProps, type, ariaDescribedBy } = props;

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
      />
    ) : (
      <Radio
        {...choice}
        key={index}
        name={field.name}
        className={className}
        ariaDescribedBy={ariaDescribedBy}
      />
    );
  });

  // map checkboxes
  return (
    <>
      {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}
      {choices}
    </>
  );
};
