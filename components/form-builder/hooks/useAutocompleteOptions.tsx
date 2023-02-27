import React from "react";
import { useTranslation } from "react-i18next";

export const useAutocompleteOptions = () => {
  const { t } = useTranslation("form-builder");

  const autocompleteOptions = [
    {
      value: "name",
      label: t("autocompleteOptions.name"),
    },
    {
      value: "given-name",
      label: t("autocompleteOptions.given-name"),
    },
    {
      value: "additional-name",
      label: t("autocompleteOptions.additional-name"),
    },
    {
      value: "family-name",
      label: t("autocompleteOptions.family-name"),
    },
    {
      value: "honorific-prefix",
      label: t("autocompleteOptions.honorific-prefix"),
    },
    {
      value: "honorific-suffix",
      label: t("autocompleteOptions.honorific-suffix"),
    },
    {
      value: "organization-title",
      label: t("autocompleteOptions.organization-title"),
    },
    {
      value: "street-address",
      label: t("autocompleteOptions.street-address"),
    },
    {
      value: "address-line1",
      label: t("autocompleteOptions.address-line1"),
    },
    {
      value: "address-line2",
      label: t("autocompleteOptions.address-line2"),
    },
    {
      value: "address-line3",
      label: t("autocompleteOptions.address-line3"),
    },
    {
      value: "address-level2",
      label: t("autocompleteOptions.address-level2"),
    },
    {
      value: "address-level1",
      label: t("autocompleteOptions.address-level1"),
    },
    {
      value: "country",
      label: t("autocompleteOptions.country"),
    },
    {
      value: "country-name",
      label: t("autocompleteOptions.country-name"),
    },
    {
      value: "postal-code",
      label: t("autocompleteOptions.postal-code"),
    },
    {
      value: "language",
      label: t("autocompleteOptions.language"),
    },
    {
      value: "bday",
      label: t("autocompleteOptions.bday"),
    },
    {
      value: "bday-day",
      label: t("autocompleteOptions.bday-day"),
    },
    {
      value: "bday-month",
      label: t("autocompleteOptions.bday-month"),
    },
    {
      value: "bday-year",
      label: t("autocompleteOptions.bday-year"),
    },
    {
      value: "url",
      label: t("autocompleteOptions.url"),
    },
  ];

  return autocompleteOptions;
};
