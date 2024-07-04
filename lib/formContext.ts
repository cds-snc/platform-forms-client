import { FormElement } from "@lib/types";
import { PublicFormRecord, ConditionalRule } from "@lib/types";

export type Group = {
  name: string;
  titleEn: string;
  titleFr: string;
  nextAction?: string | NextActionRule[];
  elements: string[];
  autoFlow?: boolean;
};
export type GroupsType = Record<string, Group>;
export type FormValues = Record<string, string | string[]>;
export type ChoiceRule = { elementId: string; choiceId: string };
export type NextActionRule = { groupId: string; choiceId: string };

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
export const mapIdsToValues = (formRecord: PublicFormRecord, values: FormValues): string[] => {
  const elementIds = formRecord.form.elements.map((element) => element.id);

  // Find elementIds that are in the current form values object
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
 * Checks if two arrays match.
 *
 * @param {Array} a - The first array.
 * @param {Array} b - The second array.
 * @returns {boolean} - Returns true if the arrays match, false otherwise.
 */
export function idArraysMatch(a: string[], b: string[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * Checks if a rule matches against conditional rule for a choiceId.
 *
 * @param {Object} rule - The rule to match.
 * @param {Object} formRecord - The form record to match against.
 * @param {Object} values - The form values from Formik.
 * @returns {boolean} - Returns true if the rule matches, false otherwise.
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
 * Checks if an element exists within a group.
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
 * Searches for form elements that have a rule for a specified item.
 *
 * @param {Array} formElements - The form elements to search.
 * @param {string | number} itemId - The id of the item to search for.
 * @returns {Array} - Returns an array of elements that have a rule for the specified item.
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
 * Searches for form elements that have a rule for a specified choice.
 *
 * @param {Array} formElements - The form elements to search.
 * @param {string | number} choiceId - The id of the choice to search for.
 * @returns {Array} - Returns an array of elements that have a rule for the specified choice.
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
 * Removes a specified elementId from the rules.
 *
 * @param {string} removeElementId - The elementId to remove from the rules. For example, if we have "1.0, 1.1, 1.2, 2.0" and we want to remove "1", it will remove "1.0, 1.1, 1.2" and leave "2".
 * @param {Array} rules - The rules to remove the elementId from.
 * @returns {Array} - Returns the rules with the elementId removed.
 */
export const cleanChoiceIdsFromRules = (removeElementId: string, rules: ConditionalRule[]) => {
  return rules.filter((rule) => {
    const ruleElementId = rule.choiceId.split(".")[0];
    return ruleElementId !== removeElementId;
  });
};

/**
 * Removes a specified choiceId from the rules.
 *
 * @param {string} removeChoiceId - The choiceId to remove from the rules. For example, if we have "1.0, 1.1, 1.2, 2.0" and we want to remove "1.0", it will leave "1.1, 1.2, 2.0".
 * @param {Array} rules - The rules to filter the choiceId from.
 * @returns {Array} - Returns the rules with the choiceId removed.
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

/**
 *
 * @param {Array} elements - The form elements to search.
 * @param {string} choiceId - The choiceId to remove from the rules.
 * @returns {Array} elements - Returns the rules with the choiceId removed.
 */
export const removeChoiceFromRules = (elements: FormElement[], choiceId: string) => {
  const updatedRules: Record<string, ConditionalRule[]> = {};

  const rules = getElementsUsingChoiceId({ formElements: elements, choiceId });
  rules.forEach((rule) => {
    const el = elements.find((element) => element.id.toString() === rule.elementId);
    if (!el) return;

    const existingRules = el.properties.conditionalRules;
    if (!existingRules) return;

    const cleanedRules = removeChoiceIdFromRules(choiceId, existingRules);

    if (cleanedRules) {
      updatedRules[el.id] = cleanedRules;
    }
  });

  return updatedRules;
};

/**
 * @param elements - The form elements to search.
 * @param rules - The rules to search
 * @returns {Array} - Returns an array of parentIds from the rules
 */
export const getRelatedElementsFromRule = (
  elements: FormElement[],
  rules: ConditionalRule[] | undefined
) => {
  if (!rules) return [];
  const ids = rules.map((rule) => Number(rule?.choiceId.split(".")[0]));
  return elements.filter((el) => Array.from(new Set(ids)).includes(el.id));
};

/**
 * @param elements: FormElement[],
 * @param matchedIds - The matchedIds from the form context
 * @returns {boolean} - Returns true if the related element has a matched rule, false otherwise
 */
export const validConditionalRules = (element: FormElement, matchedIds: string[]) => {
  if (element?.properties?.conditionalRules && element.properties.conditionalRules.length > 0) {
    const rules = element.properties?.conditionalRules;
    return rules.some((rule) => matchedIds.includes(rule?.choiceId));
  }
  // No rules to match against so it's valid.
  return true;
};

/**
 * @param elements - The form elements to search.
 * @param rules - The rules to search
 * @param matchedIds - The matchedIds from the form context
 * @returns {Array} - Returns an array of parentIds from the rules
 */
export const getRelatedIdsPassingRules = (
  elements: FormElement[],
  rules: ConditionalRule[] | undefined,
  matchedIds: string[]
) => {
  const relatedElements = getRelatedElementsFromRule(elements, rules);

  const ids = relatedElements.map((el) => {
    if (validConditionalRules(el, matchedIds)) {
      return el.id;
    }
  });

  return ids.filter((id) => id);
};

/**
 * @param elements - The form elements to search.
 * @param rules - The rules to search
 * @param matchedIds - The matchedIds from the form context
 * @returns {boolean} - Returns true if the related element has a matched rule, false otherwise
 */
export const checkRelatedRulesAsBoolean = (
  elements: FormElement[],
  rules: ConditionalRule[] | undefined,
  matchedIds: string[]
) => {
  return getRelatedIdsPassingRules(elements, rules, matchedIds).length > 0;
};

// const nextBasedOnValues = (nextActions: Group["nextAction"], values: FormValues) => {
//   let nextAction = "";

//   if (!Array.isArray(nextActions)) {
//     return nextActions;
//   }

//   nextActions.forEach((action) => {
//     const val = action.choiceId;

//     Object.keys(values).forEach((key) => {
//       // check if the val is in the values
//       if (values[key] === val) {
//         nextAction = action.groupId;
//       }
//     });
//   });

//   return nextAction;
// };

export const getNextAction = (
  groups: GroupsType,
  currentGroup: string,
  matchedIds: string[]
  // values: FormValues
) => {
  let nextAction = groups[currentGroup].nextAction || "";

  // Check to see if next action is an array
  /*
   i.e. multiple next actions based on choice

  "nextAction": [
    { "choiceId": "1.0", "groupId": "f3e91cd0-343c-46a2-acab-3346865974cb" },
    { "choiceId": "1.1", "groupId": "93278f8e-5d47-4507-a104-c47e8a950da0" }
  ]
  */
  if (Array.isArray(nextAction)) {
    let matched = false;

    // Check for catch-all value
    const catchAllRule = nextAction.find((action) => action.choiceId.includes("catch-all"));

    nextAction.forEach((action) => {
      const match = matchedIds.includes(action.choiceId);
      if (match) {
        nextAction = action.groupId;
        matched = true;
      }
    });

    // If no match, try using catch-all
    if (!matched && catchAllRule) {
      nextAction = catchAllRule.groupId;
    }
  }

  if (typeof nextAction === "string") {
    return nextAction;
  }

  return nextAction; // nextBasedOnValues(groups[currentGroup].nextAction, values);
};

/**
 * Util function to ensure locked groups are in the correct order
 * @param groups
 * @returns groups Reset the locked sections to their default state
 * see: https://github.com/cds-snc/platform-forms-client/issues/3933
 */
export const resetLockedSections = (groups: GroupsType) => {
  if (!groups) return groups;

  const { start, review, end, ...rest } = groups;

  // Get the key for the first group in ...rest
  const firstGroupKey = Object.keys(rest)[0];

  // Reset the start group to point to the first group in ...rest
  const resetStart = { ...start, autoFlow: true, nextAction: firstGroupKey };

  const resetReview = { ...review, autoFlow: true, nextAction: "end" };

  const resetEnd = end;
  delete resetEnd.nextAction; // ensure end group doesn't have a next action

  const resetGroups = { start: resetStart, ...rest, review: resetReview, end: resetEnd };
  return resetGroups;
};
