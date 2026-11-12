import { FormElement, FormElementTypes, Language, Responses } from "@gcforms/types";
import { truncateString } from "@lib/client/clientHelpers";
import { formatInvalidError } from "./formatInvalidError";
import {
  getAddressFieldLabel,
  isAddressValidationError,
} from "@clientComponents/forms/AddressComplete/utils";

type Translate = (key: string, options?: Record<string, unknown>) => string;

export const getRequiredErrorMessage = (
  element: FormElement,
  language: Language,
  t: Translate,
  entryNumber?: number
): string => {
  const title = truncateString(
    language === "fr" ? element.properties.titleFr : element.properties.titleEn
  );
  const question = getEntryQuestion(title, language, t, entryNumber);
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

const getEntryQuestion = (
  question: string,
  language: Language,
  t: Translate,
  entryNumber?: number
): string =>
  entryNumber === undefined
    ? question
    : t("input-validation.error-list.entry-question", {
        count: entryNumber,
        question,
        lng: language,
        interpolation: { escapeValue: false },
      });

export const formatErrors = (
  errors: Responses,
  elements: FormElement[],
  language: Language,
  t: Translate
): Responses => {
  const formatMessage = (message: string, element: FormElement, entryNumber?: number) =>
    message === t("input-validation.required", { lng: language }) ||
    message === t("input-validation.all-checkboxes-required", { lng: language })
      ? getRequiredErrorMessage(element, language, t, entryNumber)
      : formatInvalidError(
          message,
          language === "fr" ? element.properties.titleFr : element.properties.titleEn
        );

  const formatElementError = (
    error: Responses[string],
    element: FormElement,
    entryNumber?: number
  ): Responses[string] => {
    if (typeof error === "string") return formatMessage(error, element, entryNumber);
    if (isAddressValidationError(error)) {
      const fields = { ...error.fields };
      for (const fieldKey of Object.keys(fields) as Array<keyof typeof fields>) {
        const message = fields[fieldKey];
        if (message === t("input-validation.required", { lng: language })) {
          fields[fieldKey] = t("input-validation.error-list.default", {
            question: getEntryQuestion(
              getAddressFieldLabel(fieldKey, language),
              language,
              t,
              entryNumber
            ),
            lng: language,
            interpolation: { escapeValue: false },
          });
        } else if (message) {
          fields[fieldKey] = formatInvalidError(message, getAddressFieldLabel(fieldKey, language));
        }
      }
      return { fields };
    }
    if (element.type === FormElementTypes.dynamicRow && Array.isArray(error)) {
      const rows: unknown[] = error;
      if (!rows.every((row): row is Record<string, unknown> => !!row && typeof row === "object")) {
        return error;
      }
      return rows.map((row, rowIndex) => {
        const formattedRow: Record<string, unknown> = { ...row };
        element.properties.subElements?.forEach((subElement, index) => {
          const message = formattedRow[index];
          if (typeof message === "string" || isAddressValidationError(message)) {
            formattedRow[index] = formatElementError(message, subElement, rowIndex + 1);
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
