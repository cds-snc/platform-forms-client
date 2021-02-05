import React from "react";
import classnames from "classnames";
import { useField } from "formik";

interface CheckboxProps {
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

export const Checkbox = (
  props: CheckboxProps & JSX.IntrinsicElements["input"]
): React.ReactElement => {
  const { id, className, label, inputRef, ...inputProps } = props;

  const [field, meta] = useField(props);

  const classes = classnames("gc-input-checkbox", className);

  return (
    <div data-testid="checkbox" className={classes}>
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}

      <div>
        <input
          className="gc-input-checkbox__input"
          id={id}
          type="checkbox"
          ref={inputRef}
          {...inputProps}
          {...field}
          value={props.value}
        />
      </div>
      <label className="gc-checkbox-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
