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

type ContextualErrorCode = "input-too-long" | "file-too-large";

// 👉 The application owns presentation (code-to-translation mapping). Core owns error codes.
// See packages/core/src/validation/validationErrorTypes.ts for code definitions.
const errorTranslationKeys = {
  required: "input-validation.required",
  "all-checkboxes-required": "input-validation.all-checkboxes-required",
  "max-length": "formElements.characterCount.exceeded",
  "min-value": "input-validation.too-small",
  "max-value": "input-validation.too-large",
  "min-digits": "input-validation.too-few-digits",
  "max-digits": "input-validation.too-many-digits",
  "invalid-email": "input-validation.email",
  "invalid-alphanumeric": "input-validation.alphanumeric",
  "invalid-number": "input-validation.number",
  "invalid-date-format": "input-validation.date",
  "invalid-date": "input-validation.date-invalid",
  "invalid-phone": "input-validation.phone",
  "invalid-choice": "input-validation.combobox-strict",
  "pattern-mismatch": "input-validation.regex",
  "unsafe-regex": "input-validation.invalidRegex",
  "mismatched-type": "input-validation.mismatched-type",
  "invalid-file-type": "input-validation.file-type-invalid",
  "invalid-file-content": "input-validation.file-upload.mime.message",
} satisfies Record<Exclude<ValidationError["code"], ContextualErrorCode>, string>;

const translateError = (error: ValidationError, language: Language, t: Translate): string => {
  const options = { lng: language };
  switch (error.code) {
    case "input-too-long":
      return (
        t("input-validation.too-many-characters", options) +
        " " +
        t("formElements.characterCount.exceeded", { ...options, count: error.count })
      );
    case "min-value":
      return t(errorTranslationKeys[error.code], { ...options, min: String(error.min) });
    case "max-value":
      return t(errorTranslationKeys[error.code], { ...options, max: String(error.max) });
    case "file-too-large":
      return t(
        error.fileName
          ? "input-validation.file-upload.file-size-too-large.message"
          : "input-validation.file-size-too-large",
        { ...options, maxSizeInMb: error.maxSizeInMb, fileName: error.fileName }
      );
    default: {
      const { code, ...params } = error;
      return t(errorTranslationKeys[code], { ...options, ...params });
    }
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
