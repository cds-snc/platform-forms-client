import React from "react";
import classnames from "classnames";

interface RadioProps {
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

export const Radio = (
  props: RadioProps & JSX.IntrinsicElements["input"]
): React.ReactElement => {
  const { id, name, className, label, inputRef, ...inputProps } = props;

  const classes = classnames("gc-input-radio", className);

  return (
    <div data-testid="radio" className={classes}>
      <input
        className="gc-radio__input"
        id={id}
        type="radio"
        name={name}
        ref={inputRef}
        {...inputProps}
      />
      <label className="gc-radio-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export default Radio;
