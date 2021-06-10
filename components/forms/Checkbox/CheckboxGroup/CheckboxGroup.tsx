import React from "react";
import { Field, useField } from "formik";
import ErrorMessage from "../../ErrorMessage/ErrorMessage";
import Checkbox from "../Checkbox/Checkbox";

interface CheckboxGroupProps {
  className?: string;
  checkboxProps: Array<CheckboxProps>;
  name: string;
}

interface CheckboxProps {
  id: string;
  name: string;
  label: string;
  required?: boolean;
}

export const CheckboxGroup = (props: CheckboxGroupProps): React.ReactElement => {
  const { className, checkboxProps, name } = props;
  // <Field as={Checkbox}></Field>

  // field contains name, value, onChange, and other required Form attributes.
  const [field, meta] = useField(props);

  const checkboxes = checkboxProps.map((checkbox, index) => {
    return <Checkbox {...checkbox} key={index} name={field.name}></Checkbox>;
  });

  // map checkboxes
  return (
    <Field component="div" data-testid="checkbox" className={className} name={name}>
      {meta.touched && meta.error ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
      {checkboxes}
    </Field>
  );
};

export default CheckboxGroup;
