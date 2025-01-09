import { useTranslation } from "@i18n/client";
import { FormElement, FormElementTypes } from "@lib/types";
import { getProperty } from "@lib/i18nHelpers";

const truncateString = (str: string, maxLength: number = 50): string => {
  if (!str) return "";
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};

export const ErrorListMessage = ({
  id,
  defaultValue,
  elements,
  language,
}: {
  id: string | number | undefined;
  defaultValue: string | number | undefined;
  elements: FormElement[];
  language: string;
}) => {
  const { t } = useTranslation("form-builder");

  const element = elements.find((element) => String(element.id) === String(id));

  if (!element?.type || !defaultValue || !id) {
    return defaultValue;
  }

  let question = "";

  try {
    question = element.properties?.[getProperty("title", language)] as string;
    question = truncateString(question);
  } catch (error) {
    return defaultValue;
  }

  switch (element?.type) {
    case FormElementTypes.checkbox:
      return t("finput-validation.error-list.default", { question, lng: language });
    case FormElementTypes.dropdown:
      return t("input-validation.error-list.checkbox", { question, lng: language });
    default:
      return t("input-validation.error-list.default", { question, lng: language });
  }
};
