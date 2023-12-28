import { FormElement } from "@lib/types";
import { PublicFormRecord, ConditionalRule } from "@lib/types";

export type Group = { nextAction?: string; elements: string[] };
export type GroupsType = Record<string, Group>;
export type FormValues = Record<string, string | string[]>;
export type ChoiceRule = { elementId: string; choiceId: string };

/**
 * Ensure the choiceId is in the format "1.0"
 * @param choiceId - The choiceId to ensure is in the correct format
 * @returns The choiceId in the correct format
 * i.e. "1" becomes "1.0"
 * i.e. "1.0" stays "1.0"
 */
export const ensureChoiceId = (choiceId: string) => {
  const choiceIdParts = choiceId.split(".");
  if (choiceIdParts.length === 1) {
    return `${choiceId}.0`;
  }

  return choiceId;
};

/**
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
 * @param formRecord  - The form record to search
 * @param values - The form values from Formik
 * @returns - An array of choiceIds that match the values
 */
export const mapIdsToValues = (formRecord: PublicFormRecord, values: FormValues): string[] => {
  const elementIds = formRecord.form.elements.map((element) => element.id);

  // Find elementIds that are in the current values object
  const valueIds = elementIds.filter((id) => values[id] && values[id].length > 0);

  // For each found id, find the index of the "choice" with the specified value
  const choiceIds = valueIds.map((id) => {
    if (!values[id]) {
      return;
    }

    const value = values[id];

    if (!Array.isArray(value)) {
      const choiceId = findChoiceIndexByValue(formRecord.form.elements, id, value);
      if (choiceId > -1) {
        return `${id}.${choiceId}`;
      }
      return;
    }

    return value.map((val) => {
      const choiceId = findChoiceIndexByValue(formRecord.form.elements, id, val);
      if (choiceId > -1) {
        return `${id}.${choiceId}`;
      }
    });
  });

  // Flatten array and remove undefined values
  return choiceIds.flat().filter((id) => id) as string[];
};

/**
 * Utility function to check if two arrays match
 * @param a - The first array
 * @param b - The second array
 * @returns - True if the arrays match, false otherwise
 */
export function idArraysMatch(a: string[], b: string[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * @param rule - The rule to match
 * @param formRecord - The form record to match against
 * @param values - The form values from Formik
 * @returns - True if the rule matches, false otherwise
 */
export const matchRule = (
  rule: ConditionalRule,
  formRecord: PublicFormRecord,
  values: FormValues
) => {
  const matchedIds = mapIdsToValues(formRecord, values);
  if (matchedIds.includes(rule?.choiceId)) return true;
  return false;
};

/**
 * @param groupId - The id of the group to check
 * @param elementId - The id of the element to check
 * @param groups - The groups to check
 * @returns - True if the element is in the group, false otherwise
 */
export const inGroup = (groupId: string, elementId: number, groups: GroupsType) => {
  if (!groups[groupId]) return false;
  return groups[groupId].elements.find((value) => elementId.toString() === value);
};

/**
 * @param formElements - The form elements to search
 * @param itemId - The id of the item to search for
 * @returns - An array of elements that have a rule for the specified item
 */
export const getElementsWithRuleForChoice = ({
  formElements,
  itemId,
}: {
  formElements: FormElement[];
  itemId: number;
}) => {
  const elements: ChoiceRule[] = [];

  formElements.forEach((element) => {
    // Look for conditional rules
    if (element.properties.conditionalRules) {
      element.properties.conditionalRules.forEach((rule) => {
        if (rule.choiceId && Number(rule.choiceId.split(".")[0]) === itemId) {
          // add the element to the group
          elements.push({
            elementId: element.id.toString(),
            choiceId: ensureChoiceId(rule.choiceId),
          });
        }
      });
    }
  });

  return elements;
};

/**
 * @param formElements - The form elements to search
 * @param choiceId - The id of the choice to search for
 * @returns - An array of elements that have a rule for the specified choice
 */
export const getElementsUsingChoiceId = ({
  formElements,
  choiceId,
}: {
  formElements: FormElement[];
  choiceId: string;
}) => {
  const elements: ChoiceRule[] = [];

  formElements.forEach((element) => {
    // Look for conditional rules
    if (element.properties.conditionalRules) {
      element.properties.conditionalRules.forEach((rule) => {
        if (rule.choiceId && rule.choiceId === choiceId) {
          // add the element to the group
          elements.push({
            elementId: element.id.toString(),
            choiceId: ensureChoiceId(rule.choiceId),
          });
        }
      });
    }
  });

  return elements;
};

/**
 *
 * @param removeElementId - The elementId to remove from the rules
 * i.e. "1" from "1.0, 1.1, 1.2, 2.0" we want to remove "1.0, 1.1, 1.2" and leave "2"
 * @param rules - The rules to remove the elementId from
 * @returns The rules with the elementId removed
 */
export const cleanChoiceIdsFromRules = (removeElementId: string, rules: ConditionalRule[]) => {
  return rules.filter((rule) => {
    const ruleElementId = rule.choiceId.split(".")[0];
    return ruleElementId !== removeElementId;
  });
};

/**
 * @param removeChoiceId - The choiceId to remove from the rules
 * i.e. "1.0" from "1.0, 1.1, 1.2, 2.0" we want to remove "1.0" and leave "1.1, 1.2, 2.0"
 * @param rules - The rules to filter the choiceId from
 * @returns The rules with the choiceId removed
 */
export const removeChoiceIdFromRules = (removeChoiceId: string, rules: ConditionalRule[]) => {
  return rules.filter((rule) => {
    return rule.choiceId !== removeChoiceId;
  });
};

/**
 * Converts a list of choice rules to a list of conditional rules for a list of form elements
 * @param elements - List of form elements
 * @param properties - List of choice rules to convert i.e. [{ elementId: "1", choiceId: "1.0" }]
 * @returns {}
 */
export const choiceRulesToConditonalRules = (elements: FormElement[], properties: ChoiceRule[]) => {
  // Ensure we're working with a common set of choiceId(s) i.e. "1.0, 1.1, 1.2"
  // This should be the case as this function is called from an item (element) rules modal
  // where the choiceIds are all from the same element
  const elementIds = properties.map((prop) => prop.choiceId.split(".")[0]);
  const elementId = elementIds[0];
  const elementIdsMatch = elementIds.every((id) => id === elementId);

  if (!elementIdsMatch) {
    throw new Error("Element Ids do not match");
  }

  const updatedRules: Record<string, ConditionalRule[]> = {};

  /*
    Map over elements and update condtionalRules.
  */
  elements.forEach((element) => {
    let elementRules: ConditionalRule[] = [];
    if (element.properties.conditionalRules) {
      const rules = element.properties.conditionalRules as ConditionalRule[];
      // Remove any existing rules for the elementId
      elementRules = cleanChoiceIdsFromRules(elementId, rules);
    }
    /*
      Add new choiceIds to the appropriate elements based on the elementId
    */
    let newRules = properties.map((prop) => {
      if (prop.elementId === element.id.toString()) {
        return { choiceId: ensureChoiceId(prop.choiceId) };
      }
    });

    // remove any undefined values
    newRules = newRules.filter((rule) => rule);

    const mergedRules = [...elementRules, ...newRules] as ConditionalRule[];

    if (mergedRules.length > 0) {
      // return updated rules with keys for an element id
      updatedRules[element.id] = mergedRules;
    } else {
      // return an empty array for the element id
      updatedRules[element.id] = [];
    }
  });

  return updatedRules;
};
