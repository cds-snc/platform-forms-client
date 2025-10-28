import { Responses, PublicFormRecord, GroupsType, FormValues } from "@gcforms/types";

import { isFieldResponseValid } from "./validation/validation";

import { inGroup } from "./helpers";

import { checkVisibilityRecursive } from "./visibility";
import { valueMatchesType } from "@gcforms/core";

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
): { errors: Responses; visibility: Map<string, boolean> } => {
  const errors: Responses = {};
  const visibilityMap = new Map<string, boolean>();

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

    // Note this checks against all visible elements, not just required ones
    const result = valueMatchesType(responseValue, formElement.type, formElement);

    if (!result) {
      errors[formElement.id] = `Mismatched type for ${formElement.type} => ${responseValue}`;
      continue;
    }

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
        errors[formElement.id] =
          `Failed validation: ${result} => ${formElement.type}  => ${responseValue}`;
      }
    }
  }

  return { errors, visibility: visibilityMap };
};
