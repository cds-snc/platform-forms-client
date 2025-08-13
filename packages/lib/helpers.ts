import {
  FormElement,
  PublicFormRecord,
  GroupsType,
  FormValues,
  ConditionalRule,
} from "@gcforms/types";

/**
 * Finds an element by its id in the form elements array.
 * @param elements - The form elements to search
 * @param id - The id of the element to find
 * @returns The element with the specified id, or undefined if not found
 */
export const getElementById = (elements: FormElement[], id: string) => {
  return elements.find((el) => el.id.toString() === id);
};

/**
 * Find the index of a choice with the specified value
 * @param formElements  - The form elements to search
 * @param elementId - The id of the form element containing choices to search
 * @param value - The value to search for i.e. the 'en' or 'fr' value of a choice
 * @returns The index of the choice with the specified value
 */
export function findChoiceIndexByValue(
  formElements: FormElement[],
  elementId: number,
  value: string | string[]
) {
  // Find the form element with the specified id
  const element = formElements.find((element) => element.id === elementId);

  // If the element was not found or it doesn't have choices, return -1
  if (!element || !Array.isArray(element.properties.choices)) {
    return -1;
  }

  // Find the index of the choice with the specified value
  const choiceIndex = element.properties.choices.findIndex(
    (choice) => choice.en === value || choice.fr === value
  );

  return choiceIndex;
}

/**
 * Checks if the type of a form element is a choice input type.
 *
 * @param type - The type of the form element.
 * @returns
 */
export const isChoiceInputType = (type: string) => ["radio", "checkbox", "dropdown"].includes(type);

/**
 * Get an array of choiceIds that are "selected" /  "match" the values
 * @param {Object} formRecord - The form record to search
 * @param {Object} values - The form values from Formik. For example:
 *  {
 *    2:  ["value 1"],
 *    3:  ["value 2"],
 *    15: ["value 3"],
 *    25: ["value 4"],
 *  }
 * @returns {Array} - An array of choiceIds that match the values
 */
export const mapIdsToValues = (formElements: FormElement[], values: FormValues): string[] => {
  const elementIds = formElements.map((element) => element.id);

  // Find elementIds that are in the current form values object
  const valueIds = elementIds.filter((id) => values[id] && values[id].length > 0);

  // For each found id, find the index of the "choice" with the specified value
  const choiceIds = valueIds.map((id) => {
    if (!values[id]) {
      return;
    }

    const value = values[id];

    if (!Array.isArray(value)) {
      const choiceId = findChoiceIndexByValue(formElements, id, value);
      if (choiceId > -1) {
        return `${id}.${choiceId}`;
      }
      return;
    }

    return value.map((val) => {
      const choiceId = findChoiceIndexByValue(formElements, id, val);
      if (choiceId > -1) {
        return `${id}.${choiceId}`;
      }
    });
  });

  // Flatten array and remove undefined values
  return choiceIds.flat().filter((id) => id) as string[];
};

/**
 * Checks if a rule matches against conditional rule for a choiceId.
 *
 * @param {Object} rule - The rule to match.
 * @param {Array} formElements - The form elements to search.
 * @param {Object} values - The form values from Formik.
 * @returns {boolean} - Returns true if the rule matches, false otherwise.
 */
export const matchRule = (
  rule: ConditionalRule,
  formElements: FormElement[],
  values: FormValues
) => {
  const matchedIds = mapIdsToValues(formElements, values);

  if (matchedIds.includes(rule?.choiceId)) return true;

  return false;
};

/**
 * Returns values array but with matched ids for checkboxes and radios.
 *
 * @param formElements
 * @param values
 * @returns {FormValues} - Returns a new FormValues object with matched ids for checkboxes and radios.
 */
export const getValuesWithMatchedIds = (formElements: FormElement[], values: FormValues) => {
  const newValues = { ...values };

  Object.entries(values).forEach(([key, value]) => {
    if (["currentGroup", "groupHistory", "matchedIds"].includes(key)) return;

    const el = getElementById(formElements, key);
    const choices = el?.properties?.choices;

    if (!el) {
      return;
    }

    if (isChoiceInputType(el.type) && choices && Array.isArray(choices)) {
      if (Array.isArray(value)) {
        // For checkboxes, map the values to their choiceIds
        for (const selected of value) {
          const choiceIndex = choices.findIndex((choice) => {
            return (
              (choice.en !== "" && choice.en === selected) ||
              (choice.fr !== "" && choice.fr === selected)
            );
          });
          newValues[key] = `${el.id}.${choiceIndex}`;
          return;
        }
      } else {
        const choiceIndex = choices.findIndex(
          (choice) =>
            (choice.en !== "" && choice.en === value) || (choice.fr !== "" && choice.fr === value)
        );
        if (choiceIndex > -1) {
          newValues[key] = `${el.id}.${choiceIndex}`;
        } else {
          newValues[key] = value; // preserve original value if no match found
        }
      }
    }
  });

  return newValues;
};

/**
 * Checks if an element exists within a group.
 * @param groupId - The id of the group to check
 * @param elementId - The id of the element to check
 * @param groups - The groups to check
 * @returns - True if the element is in the group, false otherwise
 */
export const inGroup = (groupId: string, elementId: number, groups: GroupsType) => {
  const group = groups[groupId];
  if (!group || !Array.isArray(group.elements)) return false;
  return group.elements.some((value) => elementId.toString() === value);
};

/**
 * Find the group that contains the element with the specified id.
 *
 * @param formRecord
 * @param elementId
 * @returns groupId | undefined
 */
export const findGroupByElementId = (
  formRecord: PublicFormRecord,
  elementId: number
): string | undefined => {
  if (!formRecord.form.groups) {
    return undefined;
  }

  const groups = formRecord.form.groups as GroupsType;

  // Find the group that contains the element with the specified id
  return Object.keys(groups).find((groupKey) => inGroup(groupKey, elementId, groups));
};
