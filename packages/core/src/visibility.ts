import { FormElement, PublicFormRecord, GroupsType, FormValues } from "@gcforms/types";

import {
  getElementById,
  matchRule,
  getValuesWithMatchedIds,
  findGroupByElementId,
  inGroup,
} from "./helpers";

/**
 * Recursively traverses the form groups to build a list of visible groups based on values.
 * Essentially, we are reconstructing the group history (the path the
 * user took through the form) based on the current set of values.
 *
 * @param formRecord
 * @param valuesWithMatchedIds
 * @param currentGroup
 * @param visibleGroups
 * @returns
 */
export const getVisibleGroupsBasedOnValuesRecursive = (
  formRecord: PublicFormRecord,
  valuesWithMatchedIds: FormValues,
  currentGroup: string,
  visibleGroups: string[] = []
): string[] => {
  // Prevent infinite loops by checking if the current group is already in visibleGroups
  if (visibleGroups.includes(currentGroup)) {
    return visibleGroups;
  }

  const groups = formRecord.form.groups as GroupsType;

  // If the current group is not defined in groups, bail out
  if (!groups || !groups[currentGroup]) {
    return visibleGroups;
  }

  // Push the current group to visibleGroups
  visibleGroups.push(currentGroup);

  // If there is no nextAction, treat as "end"
  const nextAction = groups[currentGroup].nextAction ?? "end";

  if (typeof nextAction === "string") {
    // Nowhere to go from here
    if (nextAction === "end" || nextAction === "exit") {
      return visibleGroups;
    }

    // Only one next action, so continue to the next group
    return getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      valuesWithMatchedIds,
      nextAction,
      visibleGroups
    );
  } else if (Array.isArray(nextAction)) {
    // If nextAction is an array, we need to check each rule
    // Check for catch-all value
    const catchAllRule = nextAction.find((action) => action.choiceId.includes("catch-all"));

    let matchFound = false;

    for (const action of nextAction) {
      const elementId = action.choiceId.split(".")[0];

      // When we find a matching action, continue to the next group
      if (valuesWithMatchedIds[elementId] && valuesWithMatchedIds[elementId] === action.choiceId) {
        matchFound = true;
        return getVisibleGroupsBasedOnValuesRecursive(
          formRecord,
          valuesWithMatchedIds,
          action.groupId,
          visibleGroups
        );
      }
    }

    if (!matchFound && catchAllRule) {
      // If no match was found, but we have a catch-all rule, continue to the catch-all group
      return getVisibleGroupsBasedOnValuesRecursive(
        formRecord,
        valuesWithMatchedIds,
        catchAllRule.groupId,
        visibleGroups
      );
    }
  }

  // If no next action is found, return the current visibleGroups
  return visibleGroups;
};

/**
 * Determine the visibility of a page/group containing a given form element based on the current form values.
 *
 * @param formRecord - The form record containing the form and its groups.
 * @param element - The form element to check.
 * @param values - The current form values from Formik.
 * @returns {boolean} - Returns true if the page/group is visible, false otherwise.
 */
export const checkPageVisibility = (
  formRecord: PublicFormRecord,
  element: FormElement,
  values: FormValues
): boolean => {
  // If groups object is empty or not defined, default to visible
  if (!formRecord.form.groups || Object.keys(formRecord.form.groups).length === 0) {
    return true;
  }

  // Get the current element's group ID
  const groupId = findGroupByElementId(formRecord, element.id);

  // Get an array of values with matched ids instead of raw values
  const valuesWithMatchedIds = getValuesWithMatchedIds(formRecord.form.elements, values);

  // Recursively build up the groupHistory array based on values
  const visibleGroups = getVisibleGroupsBasedOnValuesRecursive(
    formRecord,
    valuesWithMatchedIds,
    "start"
  );

  // If the groupId is not found in the groupHistory, the page is not visible
  return !!visibleGroups.find((visitedGroupId: string | undefined) => visitedGroupId === groupId);
};

/**
 * Recursively determines the "visibility" of a form element for the purposes of validation
 * based on its conditional rules, page/group visibility, and the current form values.
 *
 * This function first checks if the current page/group is visible.
 * If the page is visible, it then evaluates the element's conditional rules.
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
  if (!checkPageVisibility(formRecord, element, values)) {
    return false;
  }

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

export const isElementVisible = (
  currentGroup: string | undefined,
  groups: GroupsType,
  values: FormValues,
  formRecord: PublicFormRecord,
  element: FormElement
) => {
  if (
    currentGroup &&
    groups &&
    Object.keys(groups).length >= 1 &&
    groups &&
    !inGroup(currentGroup, element.id, groups)
  )
    return false;

  return checkVisibilityRecursive(formRecord, element, values);
};
