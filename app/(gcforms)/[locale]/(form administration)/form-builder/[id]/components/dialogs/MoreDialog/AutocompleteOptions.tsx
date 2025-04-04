"use client";
import React, { ChangeEvent } from "react";

import { useAutocompleteOptions } from "@lib/hooks/useAutocompleteOptions";
import { useTranslation } from "react-i18next";

interface DropdownOptionProps {
  label: string;
  value: string;
  selected?: boolean;
}

const DropdownOption = (props: DropdownOptionProps): React.ReactElement => {
  return <option value={props.value}>{props.label}</option>;
};

export const AutocompleteOptions = ({
  handleChange,
  selectedValue,
}: {
  handleChange: (evt: ChangeEvent<HTMLSelectElement>) => void;
  selectedValue: string;
}) => {
  const autocompleteOptions = useAutocompleteOptions();
  const { t } = useTranslation("form-builder");

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
    <div className="gcds-select-wrapper">
      <select
        data-testid="autocomplete"
        className="gc-dropdown mb-4 inline-block"
        onChange={handleChange}
        value={selectedValue}
      >
        <option value="">{t("selectAutocomplete")}</option>
        {options}
      </select>
    </div>
  );
};
