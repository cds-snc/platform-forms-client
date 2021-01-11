import React from "react";
import classnames from "classnames";

interface CheckboxProps {
  id: string;
  name: string;
  className?: string;
  label: React.ReactNode;
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
  const { id, name, className, label, inputRef, ...inputProps } = props;

  const classes = classnames("gc-checkbox", className);

  return (
    <div data-testid="checkbox" className={classes}>
      <input
        className="gc-checkbox__input"
        id={id}
        type="checkbox"
        name={name}
        ref={inputRef}
        {...inputProps}
      />
      <label className="gc-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
