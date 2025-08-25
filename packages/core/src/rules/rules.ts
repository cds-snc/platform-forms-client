import { FormElement, ChoiceRule, ConditionalRule } from "@gcforms/types";
import { ensureChoiceId, getElementsUsingChoiceId } from "../helpers";

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
