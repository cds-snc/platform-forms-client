import React from "react";
import {
  FormElement,
  ValidationProperties,
  FormElementTypes,
  Responses,
  PublicFormRecord,
} from "@lib/types";
import { FormikProps } from "formik";
import { TFunction } from "next-i18next";
import { acceptedFileMimeTypes } from "@lib/tsUtils";
import { ErrorListItem } from "@components/forms";
import { isServer } from "./tsUtils";

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
  componentType: string,
  formElement: FormElement,
  validator: ValidationProperties,
  t: TFunction
): string | null | Record<string, unknown>[] => {
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
    case FormElementTypes.dropdown: {
      if (validator.required && (value === undefined || value === "")) {
        return t("input-validation.required");
      }
      break;
    }
    case FormElementTypes.fileInput: {
      //TODO need refactoring.
      const typedValue = value as {
        file: File | string;
        src: FileReader;
        name: string;
        size: number;
        type: string;
      };
      if ((validator.required && typedValue === undefined) || typedValue === null)
        return t("input-validation.required");
      if (validator.required && typedValue && typedValue.file === null)
        return t("input-validation.required");
      // Size limit is 8 MB
      if (typedValue?.size > 8000000) return t("input-validation.file-size-too-large");
      if (
        typedValue?.file &&
        acceptedFileMimeTypes.split(",").find((value) => value === typedValue.type) === undefined
      ) {
        return t("input-validation.file-type-invalid");
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
    if (!formElement) return errors;

    if (formElement.properties.validation) {
      const result = isFieldResponseValid(
        values[item],
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
  return errors;
};
/**
 * getErrorList is called to show validation errors at the top of the Form
 * @param props
 */

export const getErrorList = (
  props: { formRecord: PublicFormRecord } & FormikProps<Responses>
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
          />
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
    /^([a-zA-Z0-9!#$%&'*+-/=?^_`{|}~.])+@((?:[a-zA-Z0-9-.]+\.gc\.ca|cds-snc\.freshdesk\.com)|(canada|cds-snc|elections|rcafinnovation|canadacouncil)\.ca)$/;
  return regex.test(email);
};

/**
 * This function tests whether a string contains a lower case character
 * @param field A string containing a lower case character
 * @returns {boolean} The validation result
 */
export const isLowerCase = (field: string): boolean => {
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
export const isUpperCase = (field: string): boolean => {
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
export const isNumber = (field: string): boolean => {
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
export const isSymbol = (field: string): boolean => {
  const reg = new RegExp("^(?=.*?[#?!@$%^&*-])");
  if (!field || !reg.test(field)) {
    return false;
  }
  return true;
};

// Helpful to check whether a referer is local vs. an external URL
// Note: a negated version of https://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
export const localPathRegEx = new RegExp("^(?!((?:[a-z+]+:)?//))", "i");
