import { Responses, PublicFormRecord, GroupsType, FormValues } from "@gcforms/types";
import { isFieldResponseValid } from "./validation/validation";
import type { ValidationErrors } from "./validation/types";
import { inGroup } from "./helpers";
import { checkVisibilityRecursive } from "./visibility";
import {
  type ValueMatchErrors,
  type SubElementTypeMismatch,
  valueMatchesType,
  hasValue,
} from "./validation/valueMatchesType";

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
  });
  return errors;
};

/**
 * validateOnSubmit returns structured errors for form submission validation.
 * Translate these at the presentation boundary before storing them in UI state.
 * @param values
 * @param props
 */
export const validateOnSubmit = (
  values: Responses,
  props: {
    formRecord: PublicFormRecord;
  }
): ValidationErrors => {
  const { errors } = validateVisibleElements(values, props);
  return errors;
};

export const validateVisibleElements = (
  values: Responses,
  props: {
    formRecord: PublicFormRecord;
  }
): {
  errors: ValidationErrors;
  visibility: Map<string, boolean>;
  valueMatchErrors: ValueMatchErrors;
} => {
  const errors: ValidationErrors = {};
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
      const result = isFieldResponseValid(responseValue, formElement);

      if (result) {
        errors[formElement.id] = result;
      }
    }

    // Both parts of the code (above and below) should probably be merged together once we revisit form response validation

    // Note the code below checks against all visible elements, not just required ones
    if (!hasValue(responseValue)) {
      continue;
    }

    const matched = valueMatchesType(responseValue, formElement.type, formElement);

    if (matched?.error && matched.details) {
      valueMatchErrors[formElement.id] = matched.details;

      // If we already have an error for this element, skip type checking
      if (!errors[formElement.id]) {
        if (Array.isArray(matched.details)) {
          // Build errors UI display for dynamic rows
          const groupErrors: ValidationErrors[] = [];
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

          errors[formElement.id] = groupErrors;
        } else {
          errors[formElement.id] = matched.error;
        }
      }
    }
  }

  return { errors, visibility: visibilityMap, valueMatchErrors };
};
