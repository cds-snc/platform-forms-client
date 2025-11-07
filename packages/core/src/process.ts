import { Responses, PublicFormRecord, GroupsType, FormValues } from "@gcforms/types";

import { isFieldResponseValid } from "./validation/validation";

import { inGroup } from "./helpers";

import { checkVisibilityRecursive } from "./visibility";
import {
  type ValueMatchErrors,
  type SubElementTypeMismatch,
  valueMatchesType,
  hasValue,
} from "@gcforms/core";
/*
 Wrapper function to validate form responses - to ensure signature consistency  for validateOnSubmit
 this allows passing in currentGroup vs adding the currentGroup to values beforehand
*/
export const validate = ({
  values,
  currentGroup,
  formRecord,
}: {
  values: Responses;
  currentGroup: string;
  formRecord: PublicFormRecord;
}) => {
  values.currentGroup = currentGroup;

  const errors = validateOnSubmit(values, {
    formRecord,
    t: (str) => str,
  });
  return errors;
};

/**
 * validateOnSubmit is called for form submission validation
 * @param values
 * @param props
 */
export const validateOnSubmit = (
  values: Responses,
  props: {
    formRecord: PublicFormRecord;
    t: (str: string) => string;
  }
): Responses => {
  const { errors } = validateVisibleElements(values, props);
  return errors;
};

export const validateVisibleElements = (
  values: Responses,
  props: {
    formRecord: PublicFormRecord;
    t: (str: string) => string;
  }
): {
  errors: Responses;
  visibility: Map<string, boolean>;
  valueMatchErrors: ValueMatchErrors;
} => {
  const errors: Responses = {};
  const visibilityMap = new Map<string, boolean>();
  const valueMatchErrors: ValueMatchErrors = {};

  for (const formElement of props.formRecord.form.elements) {
    const responseValue = values[formElement.id];

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

    const isVisible = checkVisibilityRecursive(props.formRecord, formElement, values as FormValues);

    // If the form element is not visible, skip validation
    if (!isVisible) {
      continue;
    }

    visibilityMap.set(String(formElement.id), isVisible);

    if (formElement.properties.validation) {
      const result = isFieldResponseValid(
        responseValue,
        values,
        formElement.type,
        formElement,
        formElement.properties.validation,
        props.t
      );

      if (result) {
        errors[formElement.id] = result;
      }
    }

    // Note this checks against all visible elements, not just required ones
    // If we already have an error for this element, skip type checking
    if (!errors[formElement.id]) {
      if (!hasValue(responseValue)) {
        continue;
      }

      const matched = valueMatchesType(responseValue, formElement.type, formElement, props.t);

      if (matched?.error && matched.details) {
        if (Array.isArray(matched.details)) {
          // Build errors UI display for dynamic rows
          const groupErrors: Record<string, string>[] = [];
          const detailsArray = matched.details as SubElementTypeMismatch[];
          detailsArray.forEach((detail) => {
            if (!groupErrors[detail.rowIndex]) {
              groupErrors[detail.rowIndex] = {};
            }

            groupErrors[detail.rowIndex] = {
              ...groupErrors[detail.rowIndex],
              [detail.responseKey]: matched.error,
            };
          });

          errors[formElement.id] = groupErrors as unknown as Responses[string];

          valueMatchErrors[formElement.id] = matched.details;
        } else {
          errors[formElement.id] = matched.error;
          valueMatchErrors[formElement.id] = matched.details;
        }
      }
    }
  }

  return { errors, visibility: visibilityMap, valueMatchErrors };
};
