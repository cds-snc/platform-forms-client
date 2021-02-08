import React from "react";
import classnames from "classnames";
import { useField } from "formik";

interface RadioProps {
  id: string;
  name: string;
  className?: string;
  label: React.ReactNode;
  value?: string;
  inputRef?:
    | string
    | ((instance: HTMLInputElement | null) => void)
    | React.RefObject<HTMLInputElement>
    | null
    | undefined;
}

export const Radio = (
  props: RadioProps & JSX.IntrinsicElements["input"]
): React.ReactElement => {
  const { id, className, label, inputRef, ...inputProps } = props;

  const classes = classnames("gc-input-radio", className);

  const [field, meta] = useField(props);
  const value = field.value ? field.value[id] : field.value;

  return (
    <div data-testid="radio" className={classes}>
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}

      <input
        className="gc-radio__input"
        id={id}
        type="radio"
        ref={inputRef}
        {...inputProps}
        {...field}
        value={value}
      />
      <label className="gc-radio-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export default Radio;
