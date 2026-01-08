import React, { type JSX } from "react";
import { FormElement, Responses, PublicFormRecord } from "@gcforms/types";
import { FormikProps } from "formik";
import { ErrorListItem } from "@clientComponents/forms";
import { ErrorListMessage } from "@clientComponents/forms/ErrorListItem/ErrorListMessage";
import { isServer } from "../tsUtils";
import uuidArraySchema from "@lib/middleware/schemas/uuid-array.schema.json";
import formNameArraySchema from "@lib/middleware/schemas/submission-name-array.schema.json";

export const getFieldType = (formElement: FormElement) => {
  if (formElement.properties.autoComplete === "email") {
    return "email";
  }

  return formElement.type;
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
          return dynamicRowErrors && typeof dynamicRowErrors === "object"
            ? Object.entries(dynamicRowErrors).map(
                ([dynamicRowElementKey, dyanamicRowElementErrorValue]) => {
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
                }
              )
            : false;
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

  // Flatten the nested arrays and filter out empty/falsy values
  // Prevent rendering empty error lists
  // The error list can be nested so we want to avoid rendering empty arrays
  // i.e. [[ [] ]]
  const flattenedErrorList = errorList
    ? (errorList.flat(Infinity) as JSX.Element[]).filter(Boolean)
    : [];

  return flattenedErrorList && flattenedErrorList.length ? (
    <ol className="gc-ordered-list">{flattenedErrorList}</ol>
  ) : null;
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

/**
 * This function detects if an email address is potentially a shared inbox
 * based on patterns in the local part (before @).
 *
 * Valid patterns (likely personal emails):
 * - firstname.lastname@...
 * - firstname.last-name@... (one dot and one hyphen)
 *
 * Flagged patterns (likely shared inboxes):
 * - Multiple dots (>1): department.team.function@...
 * - Multiple hyphens (>2): team-sub-team-function@...
 * - Any underscores: team_function@...
 * - Single word with no separators (>3 chars): admin@..., info@...
 * - Mostly acronyms: Short segments (≤4 chars each) like ngn-rpg@...
 *
 * @param email The email address to check
 * @returns {boolean} True if the email appears to be a shared inbox
 */
export const isPotentialSharedInbox = (email: string): boolean => {
  // Extract the local part (before @)
  const localPart = email.split("@")[0];

  if (!localPart) return false;

  // Count separator types
  const dotCount = (localPart.match(/\./g) || []).length;
  const hyphenCount = (localPart.match(/-/g) || []).length;
  const underscoreCount = (localPart.match(/_/g) || []).length;

  // Flag if any underscores present
  if (underscoreCount > 0) return true;

  // Flag if multiple dots (>1)
  if (dotCount > 1) return true;

  // Flag if multiple hyphens (>2)
  if (hyphenCount > 2) return true;

  // Flag if single word (no separators at all)
  // Catches: ve@, admin@, info@, support@, webmaster@, etc.
  if (dotCount === 0 && hyphenCount === 0) return true;

  // Valid pattern check: exactly 1 dot and 0-1 hyphens
  // firstname.lastname or firstname.last-name
  // This must come BEFORE acronym check to allow valid names like a.b@
  if (dotCount === 1 && hyphenCount <= 1) {
    return false;
  }

  // Flag emails with hyphens but no dots (e.g., word-word@, word-word-word@)
  // Valid personal emails should have at least one dot
  // This catches: defizeronet-netzerochallenge@, surveycentrercmp-centresondagegrc@
  if (dotCount === 0 && hyphenCount > 0) {
    return true;
  }

  // Check if the local part consists mostly of acronyms (short segments)
  // Split by separators and check if most segments are ≤4 characters
  // This catches patterns like: ngn-rpg, apm-gpa, defizeronet-netzerochallenge
  const segments = localPart.split(/[.-]/);
  if (segments.length >= 2) {
    const shortSegments = segments.filter((seg) => seg.length > 0 && seg.length <= 4);
    // If more than 60% of segments are short (≤4 chars), likely acronyms/shared inbox
    if (shortSegments.length / segments.length > 0.6 && shortSegments.length >= 2) {
      return true;
    }
  }

  return false;
};
