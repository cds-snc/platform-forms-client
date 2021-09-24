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
  validator: ValidationProperties,
  t: TFunction
): string | null => {
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
      if (typedValue && typedValue.size > 8000000) return t("input-validation.file-size-too-large");
      if (
        typedValue &&
        typedValue.file &&
        acceptedFileMimeTypes.split(",").find((value) => value === typedValue.file.type) ===
          undefined
      ) {
        return t("input-validation.file-type-invalid");
      }
      break;
    }
    case "dynamicRow":
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
  const errors: Responses = {};

  function* gen() {
    yield* Object.keys(values);
  }
  const keyGen = gen();
  return validator(values, keyGen, props, errors);
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
  if (typeof window !== "undefined" && props && props.errors && props.touched && errorId) {
    const errorAlert = document.getElementById(errorId);
    if (errorAlert && typeof errorAlert !== "undefined") {
      errorAlert.focus();
    }
  }
};

/**
 * Dynamic row validator.
 * @param formElement
 * @param values
 * @param item
 * @param props
 * @param errors
 */

/**
 *
 * @param elem Compute dynamic row sub element's ids.
 * @returns
 */
export function extractSubElementId(elem: FormElement): string {
  if (!elem) throw "Invalid formElement";
  const elementIdArray = elem.subId?.split("."); //i.e "7.0.1" => ["7","0","1"]
  if (elementIdArray && elementIdArray.length > 2) {
    if (elementIdArray[1] && parseInt(elementIdArray[1]) > 0) {
      return elementIdArray[1]; // ["7","0","1"] => "0"
    } else {
      return elementIdArray[2]; // last digit "1"
    }
  }
  throw "Invalid id";
}

/**
 * Form values validator
 * @param values
 * @param keyGen
 * @param props
 * @param errors
 * @returns
 */
export function validator(
  values: FormValues,
  keyGen: Generator,
  props: DynamicFormProps,
  errors: Responses
): Responses {
  const item = keyGen.next().value;
  if (!item) return errors;
  const formElement = props.formConfig.elements.find((element) => element.id == parseInt(item));
  if (!formElement) return errors;

  if (formElement.properties.subElements && Array.isArray(values[item])) {
    // dynamic row object
    const subElements = formElement.properties.subElements.filter(
      (element) => element.type !== "richText"
    ); // no need for richText elem
    const subElemetsValues = values[parseInt(item)] as any; // any need here bc sub values can be anything.
    // caution / TODO: the number of rows must be controled whenever we add a row
    // TODO: And reinforce it here like MAX_ROW_ALLOW
    for (const index in subElements) {
      const elem = subElements[index];
      //Getting the sub element id
      const elementId = extractSubElementId(elem);
      if (elementId && elem.subId && elem.properties.validation) {
        const rowValues = subElemetsValues["0"]; // selecting the first row
        const validatorResult = isFieldResponseValid(
          rowValues[elementId],
          elem.type,
          elem.properties.validation,
          props.t
        );
        if (validatorResult) {
          errors[elem.subId] = validatorResult;
        }
      }
    }
  } else {
    if (formElement.properties.validation) {
      const result = isFieldResponseValid(
        values[item],
        formElement.type,
        formElement.properties.validation,
        props.t
      );
      if (result) {
        errors[item] = result;
      }
    }
  }
  return validator(values, keyGen, props, errors);
}
