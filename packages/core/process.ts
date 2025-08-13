import { Responses, PublicFormRecord, GroupsType, FormValues } from "@gcforms/types";

import { isFieldResponseValid } from "./validation/validation";

import { inGroup } from "./helpers";

import { checkVisibilityRecursive } from "./visibility";

/**
 * validateOnSubmit is called during Formik's submission event to validate the fields
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
  const errors: Responses = {};

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

    // If the form element is not visible, skip validation
    if (!checkVisibilityRecursive(props.formRecord, formElement, values as FormValues)) {
      continue;
    }

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

  return errors;
};

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
