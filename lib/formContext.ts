import { FormElement, FormRecord, PublicFormRecord, Response, Responses } from "@lib/types";
import { ConditionalRule } from "@lib/types";

export type Group = {
  name: string;
  titleEn: string;
  titleFr: string;
  nextAction?: string | NextActionRule[];
  elements: string[]; // NOTE: these are elementIds
  autoFlow?: boolean;
  exitUrlEn?: string; // Used when a nextAction is set to "exit"
  exitUrlFr?: string; // Used when a nextAction is set to "exit"
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
 * Finds an element by its id in the form elements array.
 * @param elements - The form elements to search
 * @param id - The id of the element to find
 * @returns The element with the specified id, or undefined if not found
 */
export const getElementById = (elements: FormElement[], id: string) => {
  return elements.find((el) => el.id.toString() === id);
};

/**
 * Checks a page/group visibility based on the current form values groupHistory.
 *
 * @param formRecord - The form record containing the form and its groups.
 * @param element - The form element to check visibility for.
 * @param values - The current form values from Formik, which should include groupHistory.
 * @returns {boolean} - Returns true if the page/group is visible based on the groupHistory, false otherwise.
 */
export const checkPageVisibility = (
  formRecord: PublicFormRecord,
  element: FormElement,
  values: FormValues
): boolean => {
  if (!formRecord.form.groups) {
    return true;
  }

  const groups = formRecord.form.groups as GroupsType;

  // Get the current element's group ID
  const groupId = Object.keys(groups).find((groupKey) => inGroup(groupKey, element.id, groups));

  const groupHistory = Array.isArray(values.groupHistory)
    ? values.groupHistory
    : [values.groupHistory];
  return !!groupHistory.find((visitedGroupId: string | undefined) => visitedGroupId === groupId);
};

/**
 * Recursively determines the "visibility" of a form element for the purposes of validation
 * based on its conditional rules and the current form values.
 *
 * Note that this does not take into account the visibility of the element in the UI based on pages/groups.
 *
 * This function checks if the provided element should be visible by evaluating its conditional rules.
 * If the element has no conditional rules, it is considered visible.
 * If the element has rules, at least one rule must be satisfied for the element to be visible.
 * When a matching rule is identified, it additionally ensures that the parent element (referenced
 * by the rule's choiceId) is also visible, and it continues checking any further ancestors.
 *
 * @param formRecord - The form record.
 * @param element - The form element whose visibility is being determined.
 * @param values - The current form values from Formik.
 * @returns {boolean} -Returns `true` if the element should be visible, `false` otherwise.
 */
export const checkVisibilityRecursive = (
  formRecord: PublicFormRecord,
  element: FormElement,
  values: FormValues,
  checked: Record<string, boolean> = {}
): boolean => {
  // If the current page is not visible, the element is not visible
  // const pageVisible = checkPageVisibility(formRecord, element, values);

  // if (!pageVisible) {
  //   return false;
  // }

  const rules = element.properties.conditionalRules;
  if (!rules || rules.length === 0) return true;

  const formElements = formRecord.form.elements;

  const elId = element.id.toString();

  if (checked[elId]) {
    return checked[elId];
  }

  // At least one rule must be satisfied for the element to be visible
  return rules.some((rule) => {
    const [elementId] = rule.choiceId.split(".");
    const ruleParent = getElementById(formElements, elementId);
    if (!ruleParent) return matchRule(rule, formElements, values);

    const isVisible =
      checkVisibilityRecursive(formRecord, ruleParent, values, checked) &&
      matchRule(rule, formElements, values);

    // Prevents re-checking the same element
    checked[elId] = isVisible;

    return isVisible;
  });
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
 * Searches for form elements that have a rule for a specified choice parent.
 * i.e. for a choiceId of "1.0", return all elements that have a rule for "1.x"
 *
 * @param {Array} formElements - The form elements to search.
 * @param {string | number} choiceId - The id of the choice to search for.
 * @returns {Array} - Returns an array of elements that have a rule for the specified choice.
 */
export const getElementsUsingChoiceIdParent = ({
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
        const parentId = choiceId.split(".")[0];
        const ruleParentId = rule.choiceId.split(".")[0];

        if (ruleParentId === parentId) {
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
 * Utility function to get all elementIds that have a rule with a parent of the choiceId
 * uses getElementsUsingChoiceIdParent to find the elements
 * @param elements - The form elements to search
 * @param choiceId - The choiceId to search for
 * @returns {Array} - Returns an array of elementIds that have a rule that contains the choiceId
 */
export const getElementIdsWithChoiceIdParent = ({
  formElements,
  choiceId,
}: {
  formElements: FormElement[];
  choiceId: string;
}) => {
  const rules = getElementsUsingChoiceIdParent({ formElements, choiceId });
  const elementIds = rules.map((rule) => rule.elementId);
  // Return a unique list of elementIds
  return Array.from(new Set(elementIds));
};

/**
 * Get all rules that are outside the parent choiceId
 * @param rules - The rules to filter
 * @param choiceId - The choiceId to filter by
 * @returns {Array} - Returns an array of rules that are outside the parent choiceId
 */
export const excludeRulesOutsideParent = (rules: ConditionalRule[], choiceId: string) => {
  return rules.filter((rule) => {
    const choiceParentId = choiceId.split(".")[0];
    const ruleChoiceParentId = rule.choiceId.split(".")[0];
    if (choiceParentId !== ruleChoiceParentId) {
      return true;
    }
    return false;
  });
};

/**
 * Get all rules that are within the parent choiceId
 * @param rules - The rules to filter
 * @param choiceId - The choiceId to filter by
 * @returns {Array} - Returns an array of rules that are within the parent choiceId
 */
export const filterRulesWithChoiceIdParent = (rules: ConditionalRule[], choiceId: string) => {
  return rules.filter((rule) => {
    const choiceParentId = choiceId.split(".")[0];
    const ruleChoiceParentId = rule.choiceId.split(".")[0];

    if (choiceParentId === ruleChoiceParentId) {
      return true;
    }
    return false;
  });
};

/**
 * Decrement the index of the choiceId
 * @param rules - The rules to adjust
 * @returns {Array} - Returns an array of rules with the choiceId index decremented
 */
const decrementChoiceIdIndexes = (rules: ConditionalRule[]) => {
  // Subtract 1 from the index of the choiceId
  const adjustedRules = rules
    .map((rule) => {
      const choiceParts = rule.choiceId.split(".");
      const choiceIndex = Number(choiceParts[1]);
      const newIndex = Number(choiceIndex) - 1;
      const newChoiceId = `${choiceParts[0]}.${newIndex}`;

      if (newIndex >= 0) {
        return { choiceId: newChoiceId };
      }

      return { choiceId: "" };
    })
    .filter((rule) => rule?.choiceId !== "");

  return adjustedRules;
};

/**
 * Filter out rules that are below the choiceId index
 * @param rules - The rules to filter
 * @param choiceId - The choiceId to filter by
 * @returns {Array} - Returns an array of rules that are above the choiceId index
 * i.e. if the choiceId is "1.3" and the rule is "1.0", "1.1" or  "1.2" etc...
 * we want to leave "1.0", "1.1" and "1.2" out of the array we're going to adjust
 */
export const filterOutRulesBelowChoiceId = (rules: ConditionalRule[], choiceId: string) => {
  return rules.filter((rule) => {
    const choiceIndex = Number(choiceId.split(".")[1]);
    const ruleIndex = Number(rule.choiceId.split(".")[1]);
    if (ruleIndex > choiceIndex) {
      return true;
    }
    return false;
  });
};

/**
 * Convert an array of rules to an array of choiceIds
 * @param rules - The rules to convert
 * @returns {Array} - Returns an array of choiceIds
 * i.e. [{ choiceId: "1.0" }, { choiceId: "1.1" }] becomes ["1.0", "1.1"]
 */
const toChoiceValues = (rules: ConditionalRule[]) => {
  return rules.map((rule) => rule.choiceId);
};

/**
 * Find the difference between two arrays
 * @param insideRange - The array to compare
 * @param aboveRange - The array to compare
 * @returns {Array} - Returns an array of the difference between the two arrays
 */
const diffAboveRange = (insideRange: ConditionalRule[], aboveRange: ConditionalRule[]) => {
  const insideRangeSet = new Set(toChoiceValues(insideRange));
  const aboveRangeSet = new Set(toChoiceValues(aboveRange));
  const rangeDifference = new Set([...insideRangeSet].filter((x) => !aboveRangeSet.has(x)));

  return Array.from(rangeDifference).map((choiceId) => {
    return { choiceId: choiceId };
  });
};

/**
 * Remove duplicate choiceIds
 * @param rules - The rules to filter
 * @returns {Array} - Returns an array of rules with duplicate choiceIds removed
 */
const removeDuplicateChoiceIds = (rules: ConditionalRule[]) => {
  const choiceIds = toChoiceValues(rules);
  const choiceIdsSet = new Set(choiceIds);

  return Array.from(choiceIdsSet)
    .map((choiceId) => {
      return { choiceId: choiceId };
    })
    .filter((rule) => rule?.choiceId);
};

/**
 * Decrement the index of the choiceId for all elements that have a rule that contains the choiceId
 * @param elements - The form elements to search
 * @param choiceId - The choiceId to search for
 * @returns {Object} - Returns an object with updated rules for each element
 */
export const decrementChoiceIds = ({
  formElements,
  choiceId,
}: {
  formElements: FormElement[];
  choiceId: string;
}) => {
  // Create an object to store the updated rules
  const updatedRules: Record<string, ConditionalRule[]> = {};

  const elementIds = getElementIdsWithChoiceIdParent({ formElements, choiceId });

  elementIds.forEach((elementId) => {
    // Find the form element that matches the elementId
    const element = formElements.filter((element) => String(element.id) === elementId)[0];

    // Get the conditional rules for the element
    const elementRules = element.properties.conditionalRules;

    if (!elementRules) return;

    // Store existing rules are outside the choice range
    // i.e. if the choiceId is "1.0" and the rule is "2.0", "2.1", "3.1" etc...
    // we want leave 2.0 out of the array we're going to adjust
    const outsideRange = excludeRulesOutsideParent(elementRules, choiceId);

    // Store existing rules that are in the choice parent range
    let insideParentRangeChoiceIds = filterRulesWithChoiceIdParent(elementRules, choiceId);

    if (insideParentRangeChoiceIds.length < 1) {
      updatedRules[elementId] = elementRules;
      return;
    }

    // Remove the choiceId from the rules before we adjust them
    insideParentRangeChoiceIds = removeChoiceIdFromRules(choiceId, insideParentRangeChoiceIds);

    const aboveRangeChoiceIds = filterOutRulesBelowChoiceId(insideParentRangeChoiceIds, choiceId);

    // Store choiceIds that are in the range but below the choiceId
    const insideBelowRangeChoiceIds = diffAboveRange(
      insideParentRangeChoiceIds,
      aboveRangeChoiceIds
    );

    const adjustedRules = decrementChoiceIdIndexes(aboveRangeChoiceIds);

    // Merge the untouched rules with the adjusted rules
    let mergedRules = [...insideBelowRangeChoiceIds, ...adjustedRules, ...outsideRange];

    // Remove duplicate rules
    mergedRules = removeDuplicateChoiceIds(mergedRules);

    if (mergedRules.length > 0) {
      updatedRules[elementId] = mergedRules;
    } else {
      updatedRules[elementId] = [];
    }
  });

  // We should now have updated and re-indexed rules for each element
  return updatedRules;
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

export const filterShownElements = (
  formRecord: FormRecord | PublicFormRecord,
  values: FormValues
) => {
  if (!formRecord || !formRecord.form || !formRecord.form.elements) {
    return [];
  }

  const elements = formRecord.form.elements;

  if (!values) {
    return elements;
  }

  return elements.filter((element) => {
    return checkVisibilityRecursive(formRecord, element, values);
  });
};

export const filterValuesForShownElements = (elements: string[], elementsShown: FormElement[]) => {
  if (!Array.isArray(elements) || !Array.isArray(elementsShown)) {
    return elements;
  }
  return elements.filter((elementId) => elementsShown.find((el) => el.id === Number(elementId)));
};

export const getElementIdsAsNumber = (elements: string[]) => {
  if (!Array.isArray(elements)) {
    return [];
  }
  return elements.map((element) => Number(element));
};

// TODO: rename to filterResponsesByShownElements
export const filterValuesByShownElements = (values: Responses, elementsShown: FormElement[]) => {
  if (!values || !Array.isArray(elementsShown)) {
    return values;
  }
  const filteredValues: { [key: string]: Response } = {};
  Object.keys(values).forEach((key) => {
    if (elementsShown.find((el) => el.id === Number(key))) {
      // Note: want to keep original value type (e.g. Checkbox=Array) or Formik may get confused
      filteredValues[key] = values[key];
    } else {
      filteredValues[key] = Array.isArray(values[key]) ? [] : "";
    }
  });
  return filteredValues;
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

  if (start === undefined || review === undefined || end === undefined) return groups;

  // Get the key for the first group in ...rest
  const firstGroupKey = Object.keys(rest)[0];

  // Reset the start group to point to the first group in ...rest
  const resetStart = { ...start, autoFlow: true, nextAction: firstGroupKey };

  const resetReview = { ...review, autoFlow: true, nextAction: "end" };

  const resetEnd = end;

  const resetGroups = {
    start: resetStart,
    ...rest,
    review: resetReview,
    end: {
      name: resetEnd.name,
      titleEn: resetEnd.titleEn,
      titleFr: resetEnd.titleFr,
      elements: resetEnd.elements,
    },
  };
  return resetGroups;
};

/**
 * Decrement the index of the choiceId for all elements that have a rule that contains the choiceId
 * @param nextAction i.e. { "groupId": "81b342c8-cd2f-47b0-ac76-268d3173d6a0","choiceId": "1.0" }
 * @param choiceId i.e. "1.0"
 */
export const decrementNextAction = (nextAction: NextActionRule, choiceId: string) => {
  // Create an object to store the updated rules
  const updatedNextActions: NextActionRule = { ...nextAction };

  // Get choiceId parts
  const choiceParts = choiceId.split(".");
  const choiceParentId = Number(choiceParts[0]);
  const choiceIndex = Number(choiceParts[1]);

  // Get nextAction choiceId parts
  const nextChoiceParts = nextAction.choiceId.split(".");
  const nextChoiceParentId = Number(nextChoiceParts[0]);
  const nextChoiceIndex = Number(nextChoiceParts[1]);

  // Parents don't match so we don't need to adjust the choiceId
  if (choiceParentId !== nextChoiceParentId) {
    return updatedNextActions;
  }

  // Check if the nextChoiceIndex is below the choiceIndex
  if (nextChoiceIndex < choiceIndex) {
    // No need to adjust the choiceId
    return updatedNextActions;
  }

  // If the nextChoiceIndex matches the choiceIndex return the nextAction
  if (nextChoiceIndex === choiceIndex) {
    // No need to adjust the choiceId
    return updatedNextActions;
  }

  // Subtract 1 from the index of the choiceId
  const newIndex = nextChoiceIndex - 1;
  const newChoiceId = `${nextChoiceParentId}.${newIndex}`;
  updatedNextActions.choiceId = newChoiceId;

  return updatedNextActions;
};

export const decrementNextActionChoiceIds = (groups: GroupsType, choiceId: string) => {
  // Create an object to store the updated rules
  const updatedGroups: GroupsType = { ...groups };

  Object.keys(groups).forEach((groupId) => {
    const group = groups[groupId];
    const nextAction = group.nextAction;

    // We only need to adjust choiceIds if the next action is an array
    if (Array.isArray(nextAction)) {
      // Filter out the actions that match the choiceId
      // to clear out the option that is to be removed
      const filteredActions = nextAction.filter((action) => action.choiceId !== choiceId);

      const updatedNextActions = filteredActions.map((action) => {
        return decrementNextAction(action, choiceId);
      });

      updatedGroups[groupId] = {
        ...group,
        nextAction: updatedNextActions,
      };
    }
  });

  return updatedGroups;
};

/**
 * Cleans up the rules for elements that have been removed
 * @param elements - The form elements to search.
 * @param rules - The rules to search
 * @returns {Array} - Returns an array of rules that are still valid
 */
export const cleanRules = (elements: FormElement[], rules: ConditionalRule[]) => {
  const updatedRules = rules.filter((rule) => {
    const parentId = rule.choiceId.split(".")[0];
    const parentElement = elements.find((el) => el.id === Number(parentId));

    // Remove the rule if the parent element is not found
    // This can happen if the element was removed but the rule was not cleaned up
    if (!parentElement) {
      return false;
    }

    return true;
  });

  return updatedRules;
};
