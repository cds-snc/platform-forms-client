import { useAutocompleteOptions } from "@components/form-builder/hooks/useAutocompleteOptions";
import { t } from "i18next";
import React, { ChangeEvent } from "react";

interface DropdownOptionProps {
  label: string;
  value: string;
  selected?: boolean;
}

const DropdownOption = (props: DropdownOptionProps): React.ReactElement => {
  return <option value={props.value}>{props.label}</option>;
};

export const AutocompleteDropdown = ({
  handleChange,
  selectedValue,
}: {
  handleChange: (evt: ChangeEvent<HTMLSelectElement>) => void;
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
    <select className="gc-dropdown inline-block" onChange={handleChange} value={selectedValue}>
      <option value="">{t("selectAutocomplete")}</option>
      {options}
    </select>
  );
};
