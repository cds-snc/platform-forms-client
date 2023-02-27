import { useAutocompleteOptions } from "@components/form-builder/hooks/useAutocompleteOptions";
import React from "react";

interface DropdownOptionProps {
  label: string;
  value: string;
}

const DropdownOption = (props: DropdownOptionProps): React.ReactElement => {
  return <option value={props.value}>{props.label}</option>;
};

export const AutocompleteDropdown = () => {
  const autocompleteOptions = useAutocompleteOptions();

  const options = autocompleteOptions.map((option, i) => {
    return <DropdownOption key={i} value={option.value} label={option.label} />;
  });

  return <select className="gc-dropdown">{options}</select>;
};
