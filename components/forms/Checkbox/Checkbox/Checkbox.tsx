import { Field } from "formik";
import React from "react";

interface CheckboxProps {
  id: string;
  name: string;
  className?: string;
  label: string;
  required?: boolean;
}

export const Checkbox = (
  props: CheckboxProps & JSX.IntrinsicElements["input"]
): React.ReactElement => {
  const { id, label, required, name } = props;

  return (
    <div className="gc-input-checkbox">
      <Field
        className="gc-input-checkbox__input"
        id={id}
        type="checkbox"
        value={label}
        required={required}
        name={name}
      />
      <label className="gc-checkbox-label" htmlFor={id}>
        <span className="checkbox-label-text">{label}</span>
      </label>
    </div>
  );
};

export default Checkbox;
