import { FormElement, FormElementTypes, Language, Responses } from "@gcforms/types";
import type {
  AddressField,
  FieldValidationError,
  ValidationError,
  ValidationErrors,
} from "@gcforms/core";
import { truncateString } from "@lib/client/clientHelpers";
import { formatInvalidError } from "./formatInvalidError";
import { getAddressFieldLabel } from "@clientComponents/forms/AddressComplete/utils";

type Translate = (key: string, options?: Record<string, unknown>) => string;

const translateError = (error: ValidationError, language: Language, t: Translate): string => {
  const options = { lng: language };
  switch (error.code) {
    case "required":
      return t("input-validation.required", options);
    case "all-checkboxes-required":
      return t("input-validation.all-checkboxes-required", options);
    case "input-too-long":
      return (
        t("input-validation.too-many-characters", options) +
        " " +
        t("formElements.characterCount.exceeded", { ...options, count: error.count })
      );
    case "max-length":
      return t("formElements.characterCount.exceeded", { ...options, count: error.count });
    case "min-value":
      return t("input-validation.too-small", { ...options, min: String(error.min) });
    case "max-value":
      return t("input-validation.too-large", { ...options, max: String(error.max) });
    case "min-digits":
      return t("input-validation.too-few-digits", options);
    case "max-digits":
      return t("input-validation.too-many-digits", options);
    case "invalid-email":
      return t("input-validation.email", options);
    case "invalid-alphanumeric":
      return t("input-validation.alphanumeric", options);
    case "invalid-number":
      return t("input-validation.number", options);
    case "invalid-date-format":
      return t("input-validation.date", options);
    case "invalid-date":
      return t("input-validation.date-invalid", options);
    case "invalid-phone":
      return t("input-validation.phone", options);
    case "invalid-choice":
      return t("input-validation.combobox-strict", options);
    case "pattern-mismatch":
      return t("input-validation.regex", options);
    case "unsafe-regex":
      return t("input-validation.invalidRegex", options);
    case "mismatched-type":
      return t("input-validation.mismatched-type", options);
    case "invalid-file-type":
      return t("input-validation.file-type-invalid", options);
    case "invalid-file-content":
      return t("input-validation.file-upload.mime.message", {
        ...options,
        fileName: error.fileName,
      });
    case "file-too-large":
      return t(
        error.fileName
          ? "input-validation.file-upload.file-size-too-large.message"
          : "input-validation.file-size-too-large",
        { ...options, maxSizeInMb: error.maxSizeInMb, fileName: error.fileName }
      );
  }
};

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

export const getEntryQuestion = (
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

// Translate structured core errors before they enter Formik's string-based error state,
// keeping inline field errors and the error summary consistent.
export const formatErrors = (
  errors: ValidationErrors,
  elements: FormElement[],
  language: Language,
  t: Translate
): Responses => {
  const formatMessage = (error: ValidationError, element: FormElement, entryNumber?: number) =>
    error.code === "required" || error.code === "all-checkboxes-required"
      ? getRequiredErrorMessage(element, language, t, entryNumber)
      : formatInvalidError(
          translateError(error, language, t),
          language === "fr" ? element.properties.titleFr : element.properties.titleEn
        );

  const formatElementError = (
    error: FieldValidationError,
    element: FormElement,
    entryNumber?: number
  ): Responses[string] => {
    if ("code" in error) return formatMessage(error, element, entryNumber);
    if ("fields" in error) {
      const fields = {} as Record<AddressField, string | null>;
      for (const fieldKey of Object.keys(error.fields) as AddressField[]) {
        const fieldError = error.fields[fieldKey];
        if (fieldError?.code === "required") {
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
        } else {
          fields[fieldKey] = fieldError
            ? formatInvalidError(
                translateError(fieldError, language, t),
                getAddressFieldLabel(fieldKey, language)
              )
            : null;
        }
      }
      return { fields };
    }
    if (element.type === FormElementTypes.dynamicRow && Array.isArray(error)) {
      return error.map((row, rowIndex) => {
        const formattedRow: Record<string, unknown> = { ...row };
        element.properties.subElements?.forEach((subElement, index) => {
          const fieldError = row[index];
          if (fieldError) {
            formattedRow[index] = formatElementError(fieldError, subElement, rowIndex + 1);
          }
        });
        return formattedRow;
      });
    }
    return error;
  };

  const formatted: Responses = {};
  for (const element of elements) {
    if (element.id in errors) {
      formatted[element.id] = formatElementError(errors[element.id], element);
    }
  }
  return formatted;
};
