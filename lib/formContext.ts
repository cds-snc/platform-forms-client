import { FormElement, FormRecord, PublicFormRecord, Response, Responses } from "@lib/types";
import { ConditionalRule } from "@lib/types";

import {
  type FormValues,
  type GroupsType,
  type ChoiceRule,
  type NextActionRule,
} from "@gcforms/types";

import { ensureChoiceId, checkVisibilityRecursive } from "@gcforms/core";

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
