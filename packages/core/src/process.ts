import { Responses, PublicFormRecord, GroupsType, FormValues } from "@gcforms/types";

import { isFieldResponseValid } from "./validation/validation";

import { inGroup } from "./helpers";

import { checkVisibilityRecursive } from "./visibility";
import { valueMatchesType, type ValueMatchErrors } from "@gcforms/core";
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
    // Only check if we actually have a value to validate
    if (
      !errors[formElement.id] &&
      responseValue !== undefined &&
      responseValue !== null &&
      responseValue !== ""
    ) {
      const matched = valueMatchesType(responseValue, formElement.type, formElement, props.t);

      if (matched?.error && matched.details) {
        if (Array.isArray(matched.details)) {
          const groupErrors = {}; //
          // const rowErrors: [];

          matched.details.forEach((detail, index) => {
            if (!groupErrors[detail.rowIndex]) {
              groupErrors[detail.rowIndex] = {};
            }

            groupErrors[detail.rowIndex] = {
              ...groupErrors[detail.rowIndex],
              [detail.responseKey]: "mismatched type",
            };
          });

          //console.log(matched.details);

          //groupErrors[1] = {1: "mismatched type", 2: "mismatched type 2"};

          errors[formElement.id] = groupErrors;

          valueMatchErrors[formElement.id] = matched.details;
        } else {
          errors[formElement.id] = "mismatched type";
          valueMatchErrors[formElement.id] = matched.details;
        }
      }
    }
  }

  return { errors, visibility: visibilityMap, valueMatchErrors };
};
