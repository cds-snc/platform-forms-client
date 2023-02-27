import { useTranslation } from "react-i18next";
import { autoCompleteFields } from "../util";

export const useAutocompleteOptions = () => {
  const { t } = useTranslation("form-builder");
  // use options to generate the autocomplete options
  const autocompleteOptions = autoCompleteFields.map((option) => {
    return {
      value: option,
      label: t(`autocompleteOptions.${option}`),
    };
  });

  return autocompleteOptions;
};
