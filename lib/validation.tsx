import React from "react";
import {
  FormValues,
  DynamicFormProps,
  InnerFormProps,
  FormElement,
  Responses,
  ValidationProperties,
} from "./types";
import { FormikProps } from "formik";
import { TFunction } from "next-i18next";

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
      regex: /\+?(\d)?[-. ]?(\(?\d{3}\)?)[-. ]?(\d{3})[-. ]?(\d{4})/,
      error: t("input-validation.phone"),
    },
    custom: {
      regex: value ? new RegExp(value) : null,
      error: t("input-validation.regex"),
    },
  };

  return type ? REGEX_CONFIG[type] : null;
};

/**
 * scrollErrorInView [private] is called when you click on an error link at the top of the form
 * @param e The click event of the error link
 * @param id The id of the input field that has the error and we need to focus
 */
const scrollErrorInView = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
  e.preventDefault();
  const labelElement = document.getElementById(`label-${id}`);
  const inputElement = document.getElementById(id);
  if (labelElement && inputElement) {
    inputElement.focus();
    labelElement.scrollIntoView();
  }
};

/**
 * validateOnSubmit is called during Formik's submission event to validate the fields
 * @param values
 * @param props
 */
export const validateOnSubmit = (values: FormValues, props: DynamicFormProps): Responses => {
  const errors: Responses = {};

  for (const item in values) {
    const formMetadata = props.formMetadata;
    const elements: Array<FormElement> = formMetadata.elements;
    const currentItem = elements.find((element) => element.id == item);

    if (!currentItem) {
      return errors;
    }

    const currentValidation = (currentItem.properties?.validation as ValidationProperties) || {};
    const formikValue = values[item] as string;
    const currentValue: string = formikValue.toString() || "";
    const currentRegex = getRegexByType(currentValidation.type, props.t, currentValue);

    // Check for required fields
    if (currentValidation && currentValidation?.required && !currentValue) {
      errors[item] = props.t("input-validation.required");
    } else if (currentValidation.type && currentRegex && currentRegex.regex) {
      // Check for different types of fields, email, date, number, custom etc
      const regex = new RegExp(currentRegex.regex);
      if (currentValue && !regex.test(currentValue)) {
        errors[item] = currentRegex.error;
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
            onClick={(e) => {
              scrollErrorInView(e, key);
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
  if (props && props.errors && props.touched && errorId) {
    const errorAlert = document.getElementById(errorId);
    if (errorAlert && typeof errorAlert !== "undefined") {
      errorAlert.focus();
    }
  }
};
