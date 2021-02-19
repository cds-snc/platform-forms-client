import React from "react";
import classnames from "classnames";
import { useField } from "formik";

interface DropdownProps {
  id: string;
  name: string;
  className?: string;
  choices: Array<string | number>;
  required?: boolean;
}

interface DropdownOptionProps {
  name: string | number;
  value: string | number;
}

const DropdownOption = (props: DropdownOptionProps): React.ReactElement => {
  return <option value={props.value}>{props.name}</option>;
};

export const Dropdown = (props: DropdownProps): React.ReactElement => {
  const { id, className, choices, required } = props;

  const classes = classnames("gc-dropdown", className);

  const [field, meta] = useField(props);

  let options = null;
  if (choices && choices.length) {
    options = choices.map((choice, i) => {
      const innerId = `${id}-${i}`;
      const value = field.value ? field.value[innerId] : field.value;
      return (
        <DropdownOption key={`key-${innerId}`} value={value} name={choice} />
      );
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
        required={required}
        {...field}
      >
        {options}
      </select>
    </>
  );
};

export default Dropdown;
