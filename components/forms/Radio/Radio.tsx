import React from "react";
import classnames from "classnames";
import { useField } from "formik";

interface RadioProps {
  id: string;
  name: string;
  className?: string;
  label: React.ReactNode;
}

export const Radio = (
  props: RadioProps & JSX.IntrinsicElements["input"]
): React.ReactElement => {
  const { id, className, label } = props;

  const classes = classnames("gc-input-radio", className);

  const [field, meta] = useField(props);

  return (
    <div data-testid="radio" className={classes}>
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}

      <input
        className="gc-radio__input"
        id={id}
        type="radio"
        {...field}
        value={field.value ? field.value[id] : ""}
      />
      <label className="gc-radio-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export default Radio;
