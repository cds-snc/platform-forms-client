import React from "react";
import classnames from "classnames";
import { useField } from "formik";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

interface DropdownProps {
  id: string;
  name: string;
  className?: string;
  choices: string[];
  required?: boolean;
  ariaDescribedBy?: string;
}

interface DropdownOptionProps {
  name: string;
  value: string;
}

const InitialDropdownOption = <option hidden value=""></option>;

const DropdownOption = (props: DropdownOptionProps): React.ReactElement => {
  return <option value={props.value}>{props.name}</option>;
};

export const Dropdown = (props: DropdownProps): React.ReactElement => {
  const { id, className, choices, required, ariaDescribedBy } = props;

  const classes = classnames("gc-dropdown", className);

  const [field, meta] = useField(props);

  const options = choices.map((choice, i) => {
    const innerId = `${id}-${i}`;
    const value = field.value ? field.value[innerId] : field.value;
    return <DropdownOption key={`key-${innerId}`} value={value} name={choice} />;
  });

  return (
    <>
      {meta.error ? <ErrorMessage>{meta.error}</ErrorMessage> : null}

      <select
        data-testid="dropdown"
        className={classes}
        id={id}
        required={required}
        aria-describedby={ariaDescribedBy}
        {...field}
      >
        {InitialDropdownOption}
        {options}
      </select>
    </>
  );
};

export default Dropdown;
