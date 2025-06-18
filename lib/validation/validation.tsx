import React, { type JSX } from "react";
import {
  FormElement,
  ValidationProperties,
  FormElementTypes,
  Responses,
  PublicFormRecord,
  FileInputResponse,
} from "@lib/types";
import { FormikProps } from "formik";
import { TFunction } from "i18next";
import { ErrorListItem } from "@clientComponents/forms";
import { ErrorListMessage } from "@clientComponents/forms/ErrorListItem/ErrorListMessage";
import { hasOwnProperty, isServer } from "../tsUtils";
import uuidArraySchema from "@lib/middleware/schemas/uuid-array.schema.json";
import formNameArraySchema from "@lib/middleware/schemas/submission-name-array.schema.json";
import { FormValues, GroupsType, checkVisibilityRecursive } from "@lib/formContext";
import { inGroup } from "@lib/formContext";
import { isFileExtensionValid, isAllFilesSizeValid } from "./fileValidationClientSide";
import { DateObject } from "@clientComponents/forms/FormattedDate/types";
import { isValidDate } from "@clientComponents/forms/FormattedDate/utils";
import { isValidEmail } from "@lib/validation/isValidEmail";
import { BODY_SIZE_LIMIT_WITH_FILES } from "@root/constants";
import { bytesToMb } from "@lib/utils/fileSize";
import { FormStatus } from "@root/packages/types/src";

/**
 * getRegexByType [private] defines a mapping between the types of fields that need to be validated
 * Also, defines the regex for validation, with a matching bilingual error message
 */
const getRegexByType = (type: string | undefined, t: TFunction, value?: string) => {
  interface RegexProps {
    [key: string]: {
      regex: RegExp | null;
      error: string;
    };
  }

  const REGEX_CONFIG: RegexProps = {
    email: {
      regex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.([a-zA-Z0-9-]{2,}))+$/,
      error: t("input-validation.email"),
    },
    alphanumeric: {
      regex: /^( )*[A-Za-z0-9\s]+( )*$/,
      error: t("input-validation.alphanumeric") /* message needs a translation */,
    },
    text: {
      regex: /^.*[^\n]+.*$/,
      error: t("input-validation.regex") /* TODO update */,
    },
    name: {
      regex: null,
      error: t("input-validation.regex"), // No error message needed for regex
    },
    number: {
      regex: /^[\d|.|,| ]+/,
      error: t("input-validation.number"),
    },
    date: {
      regex: /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/, //mm/dd/yyyy
      error: t("input-validation.date"),
    },
    phone: {
      regex: /^(\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?$/, // +125468464178
      error: t("input-validation.phone"),
    },
  };
  if (type === "custom") {
    return {
      regex: value ? new RegExp(value) : null,
      error: t("input-validation.regex"),
    };
  }
  return type ? REGEX_CONFIG[type] : null;
};

const isFieldResponseValid = (
  value: unknown,
  values: Responses,
  componentType: string,
  formElement: FormElement,
  validator: ValidationProperties,
  t: TFunction
): string | null | Record<string, unknown>[] => {
  // Note that this will ignore a file upload since the value is an object. We could check the
  // file's file name length but this is probably not necessary since OS's have a filename limit.
  if (isInputTooLong(value as string)) {
    return t("input-validation.too-many-characters");
  }

  switch (componentType) {
    case FormElementTypes.textField: {
      const typedValue = value as string;
      if (validator.required && !typedValue) return t("input-validation.required");
      const currentRegex = getRegexByType(validator.type, t, value as string);
      if (validator.type && currentRegex && currentRegex.regex) {
        // Check for different types of fields, email, date, number, custom etc
        const regex = new RegExp(currentRegex.regex);
        if (typedValue && !regex.test(typedValue)) {
          return currentRegex.error;
        }
      }
      if (validator.maxLength && (value as string).length > validator.maxLength)
        return t("input-validation.too-many-characters");
      break;
    }
    case FormElementTypes.textArea: {
      const typedValue = value as string;
      if (validator.required && !typedValue) return t("input-validation.required");
      if (validator.maxLength && (value as string).length > validator.maxLength)
        return t("input-validation.too-many-characters");
      break;
    }
    case FormElementTypes.checkbox: {
      if (validator.required) {
        if (
          validator.all &&
          (value === undefined ||
            !Array.isArray(value) ||
            (value as Array<string>).length != formElement.properties.choices?.length)
        ) {
          return t("input-validation.all-checkboxes-required");
        } else {
          if (value === undefined || !Array.isArray(value) || !(value as Array<string>).length) {
            return t("input-validation.required");
          }
        }
      }
      break;
    }
    case FormElementTypes.radio:
    case FormElementTypes.combobox:
    case FormElementTypes.dropdown: {
      if (validator.required && (value === undefined || value === "")) {
        return t("input-validation.required");
      }
      break;
    }
    case FormElementTypes.fileInput: {
      const fileInputResponse = value as FileInputResponse;

      if (
        validator.required &&
        (!fileInputResponse.name ||
          !fileInputResponse.size ||
          !fileInputResponse.based64EncodedFile)
      )
        return t("input-validation.required");

      if (fileInputResponse.size && !isAllFilesSizeValid(values)) {
        return t("input-validation.file-size-too-large-all-files", {
          maxSizeInMb: bytesToMb(BODY_SIZE_LIMIT_WITH_FILES),
        });
      }

      if (fileInputResponse.name && !isFileExtensionValid(fileInputResponse.name))
        return t("input-validation.file-type-invalid");

      break;
    }
    case FormElementTypes.formattedDate: {
      if (validator.required && !value) {
        return t("input-validation.required");
      }

      if (value && !isValidDate(JSON.parse(value as string) as DateObject)) {
        return t("input-validation.date-invalid");
      }

      break;
    }
    case FormElementTypes.addressComplete: {
      if (validator.required && !value) {
        return t("input-validation.required");
      }

      break;
    }
    case FormElementTypes.dynamicRow: {
      //set up object to store results
      // loop over rows of values

      // deterministic switch to return an error object or not
      // required because returning any object (including nulls) blocks the submit action
      let dynamicRowHasErrors = false;

      const groupErrors = (value as Array<Responses>).map((row) => {
        const rowErrors: Record<string, unknown> = {};
        for (const [responseKey, responseValue] of Object.entries(row)) {
          if (
            formElement.properties.subElements &&
            formElement.properties.subElements[parseInt(responseKey)]
          ) {
            const subElement = formElement.properties.subElements[parseInt(responseKey)];

            if (subElement?.properties?.validation) {
              const validationError = isFieldResponseValid(
                responseValue,
                values,
                subElement.type,
                subElement,
                subElement.properties.validation,
                t
              );
              rowErrors[responseKey] = validationError;
              if (validationError !== null) {
                dynamicRowHasErrors = true;
              }
            } else {
              rowErrors[responseKey] = null;
            }
          }
        }
        return rowErrors;
      });
      if (!dynamicRowHasErrors) {
        break;
      } else {
        return groupErrors;
      }
    }
    case FormElementTypes.richText:
      break;
    default:
      throw `Validation for component ${componentType} is not handled`;
  }
  return null;
};

export const getFieldType = (formElement: FormElement) => {
  if (formElement.properties.autoComplete === "email") {
    return "email";
  }

  return formElement.type;
};

const valueMatchesType = (value: unknown, type: string, formElement: FormElement) => {
  switch (type) {
    case FormElementTypes.formattedDate:
      if (value && isValidDate(JSON.parse(value as string) as DateObject)) {
        return true;
      }
      return false;
    case FormElementTypes.textField:
      if (formElement.properties.autoComplete === "email") {
        if (value && !isValidEmail(value as string)) {
          return false;
        }
      }
      return true;
    case FormElementTypes.checkbox: {
      if (Array.isArray(value)) {
        return true;
      }
      return false;
    }
    case FormElementTypes.fileInput: {
      const fileInputResponse = value as FileInputResponse;
      if (
        fileInputResponse &&
        hasOwnProperty(fileInputResponse, "name") &&
        hasOwnProperty(fileInputResponse, "size") &&
        hasOwnProperty(fileInputResponse, "based64EncodedFile")
      ) {
        return true;
      }
      return false;
    }
    case FormElementTypes.dynamicRow: {
      if (!Array.isArray(value)) {
        return false;
      }

      let valid = true;

      for (const row of value as Array<Responses>) {
        if (row === undefined || row === null || typeof row !== "object") {
          console.warn(
            `validation.tsx === Dynamic row validation failed for value: ${JSON.stringify(
              row
            )}. Expected an object with key-value pairs.`
          );
          valid = false;
          break;
        }

        for (const [responseKey, responseValue] of Object.entries(row)) {
          if (
            formElement.properties.subElements &&
            formElement.properties.subElements[parseInt(responseKey)]
          ) {
            const subElement = formElement.properties.subElements[parseInt(responseKey)];
            const result = valueMatchesType(responseValue, subElement.type, subElement);

            if (!result) {
              valid = false;
              break;
            }
          }
        }
      }

      return valid;
    }
    default:
      if (typeof value === "string") {
        return true;
      }
  }

  return false;
};

/**
 * Server-side validation the form responses
 */
export const validateResponses = async (values: Responses, formRecord: PublicFormRecord) => {
  const errors: Responses = {};
  for (const item in values) {
    const formElement = formRecord.form.elements.find((element) => element.id == parseInt(item));

    if (!formElement) {
      errors[item] = "response-to-non-existing-question";
      continue;
    }

    // Check if the incoming value matches the type of the form element
    const result = valueMatchesType(values[item], formElement.type, formElement);

    if (!result && formElement.type === FormElementTypes.dynamicRow) {
      throw new Error(FormStatus.REPEATING_SET_ERROR);
    } else {
      // Only invalidate the response if the type has a value
      // See: https://gcdigital.slack.com/archives/C05G766KW49/p1737063028759759
      if (values[item] && !result) {
        errors[item] = {
          type: getFieldType(formElement),
          value: values[item],
          message: "response-type-mismatch",
        };
      }
    }
  }

  return errors;
};

/**
 * validateOnSubmit is called during Formik's submission event to validate the fields
 * @param values
 * @param props
 */
export const validateOnSubmit = (
  values: Responses,
  props: {
    formRecord: PublicFormRecord;
    t: TFunction;
  }
): Responses => {
  const errors: Responses = {};

  for (const item in values) {
    const formElement = props.formRecord.form.elements.find(
      (element) => element.id == parseInt(item)
    );
    if (!formElement) continue;

    const currentGroup = values.currentGroup as string;
    const groups = props.formRecord.form.groups as GroupsType;

    if (
      groups &&
      currentGroup !== "" &&
      groups[currentGroup] &&
      !inGroup(currentGroup, formElement.id, groups)
    ) {
      // skip validation if the element is not in the current group
      continue;
    }

    if (!checkVisibilityRecursive(props.formRecord, formElement, values as FormValues)) {
      continue;
    }

    if (formElement.properties.validation) {
      const result = isFieldResponseValid(
        values[item],
        values,
        formElement.type,
        formElement,
        formElement.properties.validation,
        props.t
      );

      if (result) {
        errors[item] = result;
      }
    }
  }
  // console.log(errors);
  return errors;
};
/**
 * getErrorList is called to show validation errors at the top of the Form
 * @param props
 */

export const getErrorList = (
  props: { formRecord: PublicFormRecord; language: string } & FormikProps<Responses>
): JSX.Element | null => {
  if (!props.formRecord?.form || !props.errors) {
    return null;
  }
  let errorList;

  const sortedFormElementErrors = props.formRecord.form.layout
    .filter((element) => {
      return element in props.errors;
    })
    .map((element) => {
      return [element, props.errors[element]];
    });

  if (props.touched && sortedFormElementErrors.length) {
    errorList = sortedFormElementErrors.map(([formElementKey, formElementErrorValue]) => {
      if (Array.isArray(formElementErrorValue)) {
        return formElementErrorValue.map((dynamicRowErrors, dynamicRowIndex) => {
          return Object.entries(dynamicRowErrors).map(
            ([dyanamicRowElementKey, dyanamicRowElementErrorValue]) => {
              return (
                dyanamicRowElementErrorValue && (
                  <ErrorListItem
                    key={`error-${formElementKey}.${dynamicRowIndex}.${dyanamicRowElementKey}`}
                    errorKey={`${formElementKey}.${dynamicRowIndex}.${dyanamicRowElementKey}`}
                    value={`${dyanamicRowElementErrorValue as string}`}
                  />
                )
              );
            }
          );
        });
      } else {
        return (
          <ErrorListItem
            key={`error-${formElementKey}`}
            errorKey={`${formElementKey}`}
            value={`${formElementErrorValue}`}
          >
            <ErrorListMessage
              language={props.language || "en"}
              id={formElementKey}
              elements={props.formRecord.form.elements}
              defaultValue={formElementErrorValue}
            />
          </ErrorListItem>
        );
      }
    });
  }
  return errorList && errorList.length ? <ol className="gc-ordered-list">{errorList}</ol> : null;
};

/**
 * setFocusOnErrorMessage is called if form validation fails and ensures the users can see the messages
 */
export const setFocusOnErrorMessage = (props: FormikProps<Responses>, errorId: string): void => {
  if (!isServer() && props && props.errors && props.touched && errorId) {
    const errorAlert = document.getElementById(errorId);
    if (errorAlert && typeof errorAlert !== "undefined") {
      errorAlert.focus();
    }
  }
};

/**
 * This function checks if a given email is a government valid email.
 * And it returns true if the email is a valid GC email otherwise false.
 * @param email A valid government email
 * @returns {boolean} The validation result
 */
export const isValidGovEmail = (email: string): boolean => {
  const regex =
    /^([a-zA-Z0-9!#$%&'*+-/=?^_`{|}~.]+(\+[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~.]*)?)@((?:[a-zA-Z0-9-.]+\.gc\.ca|cds-snc\.freshdesk\.com)|(canada|cds-snc|elections|rcafinnovation|canadacouncil|nfb|debates-debats|invcanada)\.ca)$/;
  return regex.test(email);
};

/**
 * This function tests whether a string contains a lower case character
 * @param field A string containing a lower case character
 * @returns {boolean} The validation result
 */
export const containsLowerCaseCharacter = (field: string): boolean => {
  const reg = new RegExp("^(?=.*?[a-z])");
  if (!field || !reg.test(field)) {
    return false;
  }
  return true;
};

/**
 * This function tests whether a string contains an upper case character
 * @param field A string containing an uppwer case character
 * @returns {boolean} The validation result
 */
export const containsUpperCaseCharacter = (field: string): boolean => {
  const reg = new RegExp("^(?=.*?[A-Z])");
  if (!field || !reg.test(field)) {
    return false;
  }
  return true;
};

/**
 * This function tests whether a string contains a number
 * @param field A string containing a number
 * @returns {boolean} The validation result
 */
export const containsNumber = (field: string): boolean => {
  const reg = new RegExp("^(?=.*?[0-9])");
  if (!field || !reg.test(field)) {
    return false;
  }
  return true;
};

/**
 * This function tests whether a string contains a symbol character
 * @param field A string containing a symbol character
 * @returns {boolean} The validation result
 */
export const containsSymbol = (field: string): boolean => {
  const reg = /^(?=.*?[\^\$\*\.\[\]\{\}\(\)\?\"\!\@\#\%\&\/\\\,\>\<\'\:\;\|\_\~\`\=\+\-])/;
  if (!field || !reg.test(field)) {
    return false;
  }
  return true;
};

/**
 * This function tests whether a string contains a UUID
 * @param field A string containing a UUID
 * @returns {boolean} The validation result
 */
export const isUUID = (field: string): boolean => {
  const reg = new RegExp(uuidArraySchema.items.pattern, "i");
  if (!field || !reg.test(field)) {
    return false;
  }
  return true;
};

/**
 * This function tests whether a string contains a Form ID (used in the UI)
 * @param field A string containing a Form ID (used in the UI)
 * @returns {boolean} The validation result
 */
export const isResponseId = (field: string): boolean => {
  const reg = new RegExp(formNameArraySchema.items.pattern, "i");
  if (!field || !reg.test(field)) {
    return false;
  }
  return true;
};

/**
 * Used to limit a form input fields' character length. Limiting the length stops potential attack
 * vectors and is a first step to help prevent hitting the Notify max character limit.
 * @param inputField form input field. e.g. input, textarea, checkbox, radio, etc.
 * @param maxCharacters charcter limit. Default is 10,000.
 * @returns true if the input field is too long, false otherwise. False is also returned if the
 * value type is not a string. e.g. file input value is an object.
 */
const isInputTooLong = (inputField: string, maxCharacters = 10000): boolean => {
  return inputField?.length > maxCharacters;
};
