import React from "react";
import {
  FormValues,
  DynamicFormProps,
  InnerFormProps,
  Responses,
  ValidationProperties,
  FormElement,
} from "./types";
import { FormikProps } from "formik";
import { TFunction } from "next-i18next";
import { acceptedFileMimeTypes } from "../components/forms";
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

/**
 * scrollErrorInView [private] is called when you click on an error link at the top of the form
 * @param id The id of the input field that has the error and we need to focus
 */
const scrollErrorInView = (id: string) => {
  const inputElement = document.getElementById(id);
  const labelElement = document.getElementById(`label-${id}`);
  if (labelElement && inputElement) {
    inputElement.focus();
    labelElement.scrollIntoView();
  }
};

const isFieldResponseValid = (
  value: unknown,
  componentType: string,
  formElement: FormElement,
  validator: ValidationProperties,
  t: TFunction
): string | null | Responses => {
  switch (componentType) {
    case "textField": {
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
      break;
    }
    case "textArea": {
      const typedValue = value as string;
      if (validator.required && !typedValue) return t("input-validation.required");
      break;
    }
    case "checkbox":
    case "radio":
    case "dropdown": {
      if (validator.required && value === undefined) return t("input-validation.required");
      break;
    }
    case "fileInput": {
      //TODO need refactoring.
      const typedValue = value as { file: File; src: FileReader; name: string; size: number };
      if ((validator.required && typedValue === undefined) || typedValue === null)
        return t("input-validation.required");
      if (validator.required && typedValue && typedValue.file === null)
        return t("input-validation.required");
      // Size limit is 8 MB
      if (typedValue?.size > 8000000) return t("input-validation.file-size-too-large");
      if (
        typedValue?.file &&
        acceptedFileMimeTypes.split(",").find((value) => value === typedValue.file.type) ===
          undefined
      ) {
        return t("input-validation.file-type-invalid");
      }
      break;
    }
    case "dynamicRow":
      if (formElement.properties.subElements) {
        //set up object to store results
        const errors: Responses = {};
        // loop over rows of values
        // need to create new variable to typecast value as you cannot
        // call a method on a typecasted variable in the same line
        const values = value as Array<Record<string, string | Array<string>>>;
        for (const [rowValueIndex, rowValue] of values.entries()) {
          for (const [k, v] of Object.entries(rowValue)) {
            // get the relevant sub-element based on the current key which is the absolute
            // index of the sub-element definition in the form configuration
            const subElement = formElement.properties.subElements[parseInt(k)];
            // if the sub element has validation enabled and a subId defined then we
            // can validate
            if (subElement.properties.validation && subElement.subId) {
              const validatorResult = isFieldResponseValid(
                v,
                subElement.type,
                subElement,
                subElement.properties.validation,
                t
              );
              if (validatorResult) {
                // Split the sub id since it's dynamic. The first value in the array is static
                // The second value in the array is the row. The third value in the array is the subElement order
                const splitSubId = subElement.subId.split(".");
                errors[`${splitSubId[0]}.${rowValueIndex}.${splitSubId[2]}`] = validatorResult;
              }
            }
          }
        }
        return errors;
      }
      break;
    case "richText":
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
export const validateOnSubmit = (values: FormValues, props: DynamicFormProps): Responses => {
  let errors: Responses = {};

  for (const item in values) {
    const formElement = props.formConfig.elements.find((element) => element.id == parseInt(item));

    if (!formElement) return errors;

    if (formElement.properties.validation) {
      const result = isFieldResponseValid(
        values[item],
        formElement.type,
        formElement,
        formElement.properties.validation,
        props.t
      );
      if (result && typeof result === "object") {
        errors = {
          ...errors,
          ...result,
        };
      } else if (result) {
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
  props: InnerFormProps & FormikProps<FormValues>
): JSX.Element | null => {
  let errorList = null;
  const errorEntries = Object.entries(props.errors);
  if (props.touched && errorEntries.length) {
    errorList = errorEntries.map(([key, value], index) => {
      return (
        <li key={`error-${index}`}>
          <a
            href={`#${key}`}
            className="gc-error-link"
            key={index}
            onKeyDown={(e) => {
              if (e.code === "Space") {
                e.preventDefault();
                scrollErrorInView(key);
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              scrollErrorInView(key);
            }}
          >
            {value}
          </a>
        </li>
      );
    });
  }
  return errorList && errorList.length ? <ol className="gc-ordered-list">{errorList}</ol> : null;
};

/**
 * setFocusOnErrorMessage is called if form validation fails and ensures the users can see the messages
 */
export const setFocusOnErrorMessage = (
  props: InnerFormProps & FormikProps<FormValues>,
  errorId: string
): void => {
  if (!isServer() && props && props.errors && props.touched && errorId) {
    const errorAlert = document.getElementById(errorId);
    if (errorAlert && typeof errorAlert !== "undefined") {
      errorAlert.focus();
    }
  }
};
