import React from "react";
import { FormValues, DynamicFormProps, InnerFormProps, FormElement, Responses } from "./types";
import { FormikProps } from "formik";
import { TFunction } from "next-i18next";

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

    const currentValidation = currentItem.properties?.validation;
    const currentValue: string = values[item].toString() || "";
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
          <a href={`#${key}`} className="gc-error-link" key={index}>
            {value}
          </a>
        </li>
      );
    });
  }
  return errorList && errorList.length ? <ol className="gc-ordered-list">{errorList}</ol> : null;
};

const getRegexByType = (type: string | undefined, t: TFunction, value?: string) => {
  const REGEX_CONFIG = {
    email: {
      regex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      error: t("input-validation.email"),
    },
    text: {
      regex: /^[0-9a-zA-Z]+$/,
      error: t("input-validation.text"),
    },
    number: {
      regex: /^[0-9]+$/,
      error: t("input-validation.number"),
    },
    date: {
      regex: /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/,
      error: t("input-validation.date"),
    },
    phone: {
      regex: /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/,
      error: t("input-validation.phone"),
    },
    custom: {
      regex: value,
      error: t("input-validation.regex"),
    },
  };

  return type ? REGEX_CONFIG[type] : null;
};
