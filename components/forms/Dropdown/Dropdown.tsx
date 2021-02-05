import React from "react";
import classnames from "classnames";
import { useField } from "formik";

interface DropdownProps {
  id: string;
  name: string;
  className?: string;
  choices: Array<string | number>;
  children?: React.ReactNode;
  inputRef?:
    | string
    | ((instance: HTMLSelectElement | null) => void)
    | React.RefObject<HTMLSelectElement>
    | null
    | undefined;
}

interface DropdownOptionProps {
  name: string | number;
  value: string | number;
}

const DropdownOption = (props: DropdownOptionProps): React.ReactElement => {
  return <option value={props.value}>{props.name}</option>;
};

export const Dropdown = (props: DropdownProps): React.ReactElement => {
  const { id, name, className, inputRef, choices, ...inputProps } = props;

  const classes = classnames("gc-dropdown", className);

  const [field, meta] = useField(props);

  let options = null;
  if (choices && choices.length) {
    options = choices.map((choice, i) => {
      const value = field.value ? field.value[id] : field.value;
      return <DropdownOption key={`key-${i}`} value={value} name={choice} />;
    });
  }

  return (
    <>
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}

      <select
        data-testid="dropdown"
        className={classes}
        id={id}
        ref={inputRef}
        {...inputProps}
        {...field}
      >
        {options}
      </select>
    </>
  );
};

export default Dropdown;
