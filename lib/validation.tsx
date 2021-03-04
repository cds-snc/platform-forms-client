import React from "react";
import { FormValues, DynamicFormProps, InnerFormProps, FormElement, Responses } from "./types";
import { FormikProps } from "formik";

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

    // Check for required fields
    if (currentValidation && currentValidation?.required && !values[item]) {
      errors[item] = props.t("input-validation.required");
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
