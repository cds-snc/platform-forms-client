import { Responses, PublicFormRecord, GroupsType, FormValues } from "@gcforms/types";

import { isFieldResponseValid } from "./validation/validation";

import { inGroup } from "./helpers";

import { checkVisibilityRecursive } from "./visibility";

/* Wrapper function to validate form responses - to ensure signature consistency  for validateOnSubmit  */
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

/**
 * validateOnSubmit is called for form submission validation
 * @param values
 * @param props
 */
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
    const item = values[formElement.id];

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
        item,
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
  }

  return { errors, visibility: visibilityMap };
};
