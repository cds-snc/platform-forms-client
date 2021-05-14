import React from "react";
import classnames from "classnames";
import { useField } from "formik";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

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
  const { id, className, label, required } = props;

  // field contains name, value, onChange, and other required Form attributes.
  const [field, meta] = useField(props);

  const classes = classnames("gc-input-checkbox", className);

  return (
    <div data-testid="checkbox" className={classes}>
      {meta.touched && meta.error ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
      <input
        className="gc-input-checkbox__input"
        id={id}
        type="checkbox"
        {...field}
        value={label}
        required={required}
      />
      <label className="gc-checkbox-label" htmlFor={id}>
        <span className="checkbox-label-text">{label}</span>
      </label>
    </div>
  );
};

export default Checkbox;
