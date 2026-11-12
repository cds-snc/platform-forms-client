import { FormElement, FormElementTypes, Language, Responses } from "@gcforms/types";
import { truncateString } from "@lib/client/clientHelpers";
import {
  getAddressFieldLabel,
  isAddressValidationError,
} from "@clientComponents/forms/AddressComplete/utils";

type Translate = (key: string, options?: Record<string, unknown>) => string;

export const getRequiredErrorMessage = (
  element: FormElement,
  language: Language,
  t: Translate
): string => {
  const question = truncateString(
    language === "fr" ? element.properties.titleFr : element.properties.titleEn
  );
  let key = "default";
  if (element.properties.validation?.all === true) {
    key = "check-all";
  } else {
    switch (element.type) {
      case FormElementTypes.checkbox:
        key = "checkbox";
        break;
      case FormElementTypes.dropdown:
        key = "select";
        break;
      case FormElementTypes.fileInput:
        key = "file-input";
        break;
      case FormElementTypes.formattedDate:
        key = "date-invalid";
        break;
    }
  }
  return t(`input-validation.error-list.${key}`, {
    question,
    lng: language,
    interpolation: { escapeValue: false },
  });
};

export const formatRequiredErrors = (
  errors: Responses,
  elements: FormElement[],
  language: Language,
  t: Translate
): Responses => {
  const formatMessage = (message: string, element: FormElement) =>
    message === t("input-validation.required", { lng: language }) ||
    message === t("input-validation.all-checkboxes-required", { lng: language })
      ? getRequiredErrorMessage(element, language, t)
      : message;

  const formatElementError = (
    error: Responses[string],
    element: FormElement
  ): Responses[string] => {
    if (typeof error === "string") return formatMessage(error, element);
    if (isAddressValidationError(error)) {
      const fields = { ...error.fields };
      for (const fieldKey of Object.keys(fields) as Array<keyof typeof fields>) {
        const message = fields[fieldKey];
        if (message === t("input-validation.required", { lng: language })) {
          fields[fieldKey] = t("input-validation.error-list.default", {
            question: getAddressFieldLabel(fieldKey, language),
            lng: language,
            interpolation: { escapeValue: false },
          });
        }
      }
      return { fields };
    }
    if (element.type === FormElementTypes.dynamicRow && Array.isArray(error)) {
      const rows: unknown[] = error;
      if (!rows.every((row): row is Record<string, unknown> => !!row && typeof row === "object")) {
        return error;
      }
      return rows.map((row) => {
        const formattedRow: Record<string, unknown> = { ...row };
        element.properties.subElements?.forEach((subElement, index) => {
          const message = formattedRow[index];
          if (typeof message === "string" || isAddressValidationError(message)) {
            formattedRow[index] = formatElementError(message, subElement);
          }
        });
        return formattedRow;
      });
    }
    return error;
  };

  const formatted = { ...errors };
  for (const element of elements) {
    if (element.id in formatted) {
      formatted[element.id] = formatElementError(formatted[element.id], element);
    }
  }
  return formatted;
};
