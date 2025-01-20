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

  let question = "";
  let element: FormElement | null = null;

  try {
    element = (elements && elements.find((element) => String(element.id) === String(id))) || null;

    if (!element?.type || !defaultValue || !id) {
      throw new Error("Invalid element");
    }

    question = element.properties?.[getProperty("title", language)] as string;
    question = truncateString(question);
  } catch (error) {
    return defaultValue;
  }

  let elementType = element?.type;

  if (element.properties.validation?.all === true) {
    elementType = FormElementTypes.attestation;
  }

  switch (elementType) {
    case FormElementTypes.attestation:
      return t("input-validation.error-list.check-all", {
        question,
        lng: language,
        interpolation: {
          escapeValue: false,
        },
      });
    case FormElementTypes.checkbox:
      return t("input-validation.error-list.checkbox", {
        question,
        lng: language,
        interpolation: {
          escapeValue: false,
        },
      });
    case FormElementTypes.dropdown:
      return t("input-validation.error-list.select", {
        question,
        lng: language,
        interpolation: {
          escapeValue: false,
        },
      });
    case FormElementTypes.fileInput:
      return t("input-validation.error-list.file-input", {
        question,
        lng: language,
        interpolation: {
          escapeValue: false,
        },
      });
    default:
      return t("input-validation.error-list.default", {
        question,
        lng: language,
        interpolation: {
          escapeValue: false,
        },
      });
  }
};
