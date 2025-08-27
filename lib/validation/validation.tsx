import React, { type JSX } from "react";
import { FormElement, FormElementTypes, Responses, PublicFormRecord } from "@gcforms/types";
import { FormikProps } from "formik";
import { ErrorListItem } from "@clientComponents/forms";
import { ErrorListMessage } from "@clientComponents/forms/ErrorListItem/ErrorListMessage";
import { isServer } from "../tsUtils";
import uuidArraySchema from "@lib/middleware/schemas/uuid-array.schema.json";
import formNameArraySchema from "@lib/middleware/schemas/submission-name-array.schema.json";
import { DateObject } from "@clientComponents/forms/FormattedDate/types";
import { isValidDate } from "@clientComponents/forms/FormattedDate/utils";
import { isValidEmail } from "@lib/validation/isValidEmail";

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
      if (
        value !== null &&
        typeof value == "object" &&
        "name" in value &&
        "size" in value &&
        "id" in value
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
  let errorList: React.JSX.Element[] = [];

  const sortedFormElementErrors = props.formRecord.form.layout
    .filter((element) => {
      return element in props.errors;
    })
    .map((element) => {
      return [element, props.errors[element]];
    });

  if (props.touched && sortedFormElementErrors.length) {
    errorList = sortedFormElementErrors.flatMap(
      ([formElementKey, formElementErrorValue]): React.JSX.Element[] => {
        if (Array.isArray(formElementErrorValue)) {
          return (formElementErrorValue as Record<string, string | undefined>[]).flatMap(
            (dynamicRowErrors, dynamicRowIndex) => {
              return Object.entries(dynamicRowErrors)
                .map(([dynamicRowElementKey, dyanamicRowElementErrorValue]) => {
                  const id = `${formElementKey}.${dynamicRowIndex}.${dynamicRowElementKey}`;
                  const parentElement = props.formRecord.form.elements.find(
                    (el) => el.id === formElementKey
                  );

                  let subElement;

                  if (dyanamicRowElementErrorValue) {
                    const subElements = parentElement?.properties.subElements;
                    subElement = subElements && subElements[Number(dynamicRowElementKey)];
                  }

                  return (
                    dyanamicRowElementErrorValue && (
                      <ErrorListItem
                        key={`error-${formElementKey}.${dynamicRowIndex}.${dynamicRowElementKey}`}
                        errorKey={`${formElementKey}.${dynamicRowIndex}.${dynamicRowElementKey}`}
                        value={`${dyanamicRowElementErrorValue as string}`}
                      >
                        <ErrorListMessage
                          language={props.language || "en"}
                          id={id}
                          elements={[]}
                          defaultValue={""}
                          subElement={subElement}
                        />
                      </ErrorListItem>
                    )
                  );
                })
                .filter((item) => item !== undefined && item !== null && item !== "");
            }
          );
        } else {
          return [
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
            </ErrorListItem>,
          ];
        }
      }
    );
  }
  return errorList.length > 0 ? <ol className="gc-ordered-list">{errorList}</ol> : null;
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
    /^([a-zA-Z0-9!#$%&'*+-/=?^_`{|}~.]+(\+[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~.]*)?)@((?:[a-zA-Z0-9-.]+\.gc\.ca|cds-snc\.freshdesk\.com)|(canada|cds-snc|elections|rcafinnovation|canadacouncil|nfb|debates-debats|invcanada|gg)\.ca)$/;
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
