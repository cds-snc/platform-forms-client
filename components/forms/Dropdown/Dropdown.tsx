import React from "react";
import classnames from "classnames";

interface DropdownProps {
  id: string;
  name: string;
  className?: string;
  choices: Array<any>;
  inputRef?:
    | string
    | ((instance: HTMLSelectElement | null) => void)
    | React.RefObject<HTMLSelectElement>
    | null
    | undefined;
}

interface DropdownOptionProps { 
  key: any;
  name: any;
  value: any;
}

const DropdownOption = (props: DropdownOptionProps): React.ReactElement => {
  return <option key={props.key} value={props.value}>{props.name}</option>;
};

export const Dropdown = (props: DropdownProps): React.ReactElement => {
  const { id, name, className, inputRef, choices, ...inputProps } = props;

  const classes = classnames("gc-dropdown", className);

  let options = null;
  if (choices && choices.length) {
    options = choices.map((choice) => {
      return <DropdownOption key={`${choice}-key`} value={choice} name={choice}/>;
    });
  }

  return (
    <select
      data-testid="dropdown"
      className={classes}
      id={id}
      name={name}
      ref={inputRef}
      {...inputProps}
    >
      {options}
    </select>
  );
};

export default Dropdown;
