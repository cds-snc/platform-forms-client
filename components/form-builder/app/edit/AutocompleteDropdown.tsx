import { useAutocompleteOptions } from "@components/form-builder/hooks/useAutocompleteOptions";
import React from "react";

interface DropdownOptionProps {
  label: string;
  value: string;
  selected?: boolean;
}

const DropdownOption = (props: DropdownOptionProps): React.ReactElement => {
  return (
    <option value={props.value} selected={props.selected ?? false}>
      {props.label}
    </option>
  );
};

export const AutocompleteDropdown = ({
  handleChange,
  selectedValue,
}: {
  handleChange: (value: string) => void;
  selectedValue: string;
}) => {
  const autocompleteOptions = useAutocompleteOptions();

  const options = autocompleteOptions.map((option, i) => {
    return (
      <DropdownOption
        key={i}
        value={option.value}
        label={option.label}
        selected={option.value === selectedValue}
      />
    );
  });

  return (
    <select className="gc-dropdown" onChange={handleChange}>
      <option value="">Select an autocomplete attribute</option>
      {options}
    </select>
  );
};
