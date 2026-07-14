import { FormElement, PublicFormRecord, GroupsType, FormValues } from "@gcforms/types";
import {
  isChoiceInputType,
  matchRule,
  getValuesWithMatchedIds,
  findGroupByElementId,
  inGroup,
} from "./helpers";

// Element dependencies map showing which element IDs depend on which other elements
export type ElementDependencies = Map<string, Set<string>>;

// Helper to build an element lookup map to replace slow array searches
const buildElementMap = (elements: FormElement[]): Map<string, FormElement> => {
  return new Map(elements.map((el) => [el.id.toString(), el]));
};

/**
 * Recursively traverses the form groups to build a list of visible groups based on values.
 * Essentially, we are reconstructing the group history (the path the
 * user took through the form) based on the current set of values.
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
  }

  if (Array.isArray(nextAction)) {
    const currentGroupElementIds = new Set((groups[currentGroup].elements || []).map(String));
    const relevantNextActions = nextAction.filter((action) => {
      if (action.choiceId.includes("catch-all")) {
        return true;
      }

      const elementId = action.choiceId.split(".")[0];
      return currentGroupElementIds.has(elementId);
    });

    const catchAllRule = relevantNextActions.find((action) =>
      action.choiceId.includes("catch-all")
    );
    let matchFound = false;

    for (const action of relevantNextActions) {
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
 */
export const checkPageVisibility = (
  formRecord: PublicFormRecord,
  element: FormElement,
  values: FormValues,
  precomputedVisibleGroups?: Set<string>
): boolean => {
  // If groups object is empty or not defined, default to visible
  if (!formRecord.form.groups || Object.keys(formRecord.form.groups).length === 0) {
    return true;
  }

  // Get the current element's group ID
  const groupId = findGroupByElementId(formRecord, element.id);
  if (!groupId) return false;

  // Use pre-computed set if it exists to avoid walking the "tree" repeatedly
  if (precomputedVisibleGroups) {
    return precomputedVisibleGroups.has(groupId);
  }

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
 */
export const checkVisibilityRecursive = (
  formRecord: PublicFormRecord,
  element: FormElement,
  values: FormValues,
  checked: Record<string, boolean> = {},
  elementMap?: Map<string, FormElement>,
  visibleGroupsCache?: Set<string>
): boolean => {
  const elId = element.id.toString();

  // Check if already computed
  if (checked[elId] !== undefined) {
    return checked[elId];
  }

  // Resolve or initialize helper functions dynamically
  const activeElementMap = elementMap ?? buildElementMap(formRecord.form.elements);
  const activeVisibleGroups =
    visibleGroupsCache ??
    new Set(
      getVisibleGroupsBasedOnValuesRecursive(
        formRecord,
        getValuesWithMatchedIds(formRecord.form.elements, values),
        "start"
      )
    );

  if (!checkPageVisibility(formRecord, element, values, activeVisibleGroups)) {
    checked[elId] = false;
    return false;
  }

  const rules = element.properties.conditionalRules;
  if (!rules || rules.length === 0) {
    checked[elId] = true;
    return true;
  }

  // Mark as being checked (prevents circular dependency infinite loops)
  // Assume false during recursion to break cycles
  checked[elId] = false;

  // At least one rule must be satisfied for the element to be visible
  const isVisible = rules.some((rule) => {
    const [elementId] = rule.choiceId.split(".");
    const ruleParent = activeElementMap.get(elementId);
    if (!ruleParent) return matchRule(rule, formRecord.form.elements, values);

    return (
      checkVisibilityRecursive(
        formRecord,
        ruleParent,
        values,
        checked,
        activeElementMap,
        activeVisibleGroups
      ) && matchRule(rule, formRecord.form.elements, values)
    );
  });

  // Update with final computed value
  checked[elId] = isVisible;

  return isVisible;
};

export const isElementVisible = (
  currentGroup: string | undefined,
  groups: GroupsType | undefined,
  values: FormValues,
  formRecord: PublicFormRecord,
  element: FormElement,
  elementMap?: Map<string, FormElement>,
  checked: Record<string, boolean> = {}
): boolean => {
  if (currentGroup && groups && Object.keys(groups).length > 0) {
    if (!inGroup(currentGroup, element.id, groups)) return false;
  }

  return checkVisibilityRecursive(formRecord, element, values, checked, elementMap);
};

/**
 * Builds an element dependencies map showing which elements depend on which other elements
 * based on conditional rules.
 *
 * @param formElements - The form elements to analyze
 * @returns A map where keys are element IDs and values are sets of element IDs that depend on them
 */
export const buildElementDependencies = (formElements: FormElement[]): ElementDependencies => {
  const elementDependencies: ElementDependencies = new Map();

  formElements.forEach((element) => {
    const rules = element.properties.conditionalRules;
    if (!rules || rules.length === 0) return;

    rules.forEach((rule) => {
      const [parentElementId] = rule.choiceId.split(".");
      let dependents = elementDependencies.get(parentElementId);
      if (!dependents) {
        dependents = new Set();
        elementDependencies.set(parentElementId, dependents);
      }
      dependents.add(element.id.toString());
    });
  });

  return elementDependencies;
};

/**
 * Collects all elements that depend on the given element IDs.
 * This handles chains of dependencies (A depends on B, B depends on C, etc.)
 *
 * Note: Exploring using a stack here vs recursion for slight perf gains.
 * Can go back to recursion if this is hard to read.
 *
 * @param elementIds - The starting element IDs to check dependencies for
 * @param elementDependencies - The element dependencies map
 * @param visited - Set of already visited element IDs to prevent infinite loops
 * @returns A set of all element IDs that directly or transitively depend on the input elements
 */
export const collectDependentElements = (
  initialElementIds: string[],
  elementDependencies: ElementDependencies
): Set<string> => {
  const dependents = new Set<string>();
  const stack: string[] = [...initialElementIds];

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (!currentId) continue;

    const directDependents = elementDependencies.get(currentId);
    if (!directDependents) continue;

    directDependents.forEach((depId) => {
      if (!dependents.has(depId)) {
        dependents.add(depId);
        stack.push(depId);
      }
    });
  }

  return dependents;
};
// Note: recursive version below -- Can use instead or delete.
// export const collectDependentElements = (
//   elementIds: string[],
//   elementDependencies: ElementDependencies,
//   visited: Set<string> = new Set()
// ): Set<string> => {
//   const dependents = new Set<string>();

//   elementIds.forEach((elementId) => {
//     // Prevent infinite loops in circular dependencies
//     if (visited.has(elementId)) return;
//     visited.add(elementId);

//     // Get direct dependents
//     const directDependents = elementDependencies.get(elementId);
//     if (directDependents) {
//       directDependents.forEach((depId) => {
//         dependents.add(depId);
//       });

//       // Recursively collect transitive dependents
//       const transitiveDependents = collectDependentElements(
//         Array.from(directDependents),
//         elementDependencies,
//         visited
//       );
//       transitiveDependents.forEach((depId) => dependents.add(depId));
//     }
//   });

//   return dependents;
// };

/**
 * Computes the visibility of all form elements at once.
 *
 * @param formRecord - The form record
 * @param values - The current form values
 * @returns A map of element IDs to their visibility status
 */
export const computeAllVisibility = (
  formRecord: PublicFormRecord,
  values: FormValues
): Map<string, boolean> => {
  const visibilityMap = new Map<string, boolean>();
  const checked: Record<string, boolean> = {};

  const elementMap = buildElementMap(formRecord.form.elements);
  const visibleGroupsCache = new Set(
    getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      getValuesWithMatchedIds(formRecord.form.elements, values),
      "start"
    )
  );

  formRecord.form.elements.forEach((element) => {
    const isVisible = checkVisibilityRecursive(
      formRecord,
      element,
      values,
      checked,
      elementMap,
      visibleGroupsCache
    );
    visibilityMap.set(element.id.toString(), isVisible);
  });

  return visibilityMap;
};

/**
 * Rcomputes visibility only for elements that depend on the changed elements.
 *
 * @param formRecord - The form record
 * @param values - The current form values
 * @param changedElementIds - IDs of elements whose values changed
 * @param elementDependencies - The pre-computed element dependencies map
 * @param currentVisibilityMap - The current visibility map to update
 * @returns Updated visibility map
 */
export const recomputeAffectedVisibility = (
  formRecord: PublicFormRecord,
  values: FormValues,
  changedElementIds: string[],
  elementDependencies: ElementDependencies,
  currentVisibilityMap: Map<string, boolean>
): Map<string, boolean> => {
  // Collect all elements that depend on the changed elements
  const affectedElementIds = collectDependentElements(changedElementIds, elementDependencies);

  // If no elements are affected, return the current map
  if (affectedElementIds.size === 0) {
    return currentVisibilityMap;
  }

  // Create a new map to avoid mutating the current one
  const updatedMap = new Map(currentVisibilityMap);
  const elementMap = buildElementMap(formRecord.form.elements);

  const visibleGroupsCache = new Set(
    getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      getValuesWithMatchedIds(formRecord.form.elements, values),
      "start"
    )
  );

  // Build a cache
  const checked: Record<string, boolean> = {};
  currentVisibilityMap.forEach((val, key) => {
    if (!affectedElementIds.has(key)) {
      checked[key] = val;
    }
  });

  // Recompute visibility only for affected elements
  affectedElementIds.forEach((elementId) => {
    const element = elementMap.get(elementId);
    if (element) {
      const isVisible = checkVisibilityRecursive(
        formRecord,
        element,
        values,
        checked,
        elementMap,
        visibleGroupsCache
      );
      updatedMap.set(elementId, isVisible);
    }
  });

  return updatedMap;
};

/**
 * Determines which element IDs have changed between two sets of form values.
 * Only returns IDs for choice-based elements (radio, checkbox, dropdown) that have conditional dependents.
 *
 * @param oldValues - The previous form values
 * @param newValues - The new form values
 * @param formElements - The form elements
 * @param elementDependencies - The element dependencies map to check which elements have dependents
 * @returns Array of element IDs that changed and have dependents
 */
export const getChangedChoiceElementIds = (
  oldValues: FormValues,
  newValues: FormValues,
  formElements: FormElement[],
  elementDependencies: ElementDependencies
): string[] => {
  const changedIds: string[] = [];
  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
  const elementMap = buildElementMap(formElements);

  allKeys.forEach((key) => {
    // Check if value actually changed
    if (JSON.stringify(oldValues[key]) === JSON.stringify(newValues[key])) return;

    // Check if this element is a choice-based input
    const element = elementMap.get(key);
    if (!element || !isChoiceInputType(element.type)) return;

    // Check if any elements depend on this one
    if (elementDependencies.has(key)) {
      changedIds.push(key);
    }
  });

  return changedIds;
};

export interface VisibilityState {
  visibilityMap: Map<string, boolean>;
  elementDependencies: ElementDependencies;
}

/**
 * Initializes the visibility state for a form
 *
 * @param formRecord - The form record
 * @param values - Initial form values
 * @returns Initial visibility state
 */
export const initializeVisibilityState = (
  formRecord: PublicFormRecord,
  values: FormValues
): VisibilityState => {
  const elementDependencies = buildElementDependencies(formRecord.form.elements);
  const visibilityMap = computeAllVisibility(formRecord, values);

  return {
    visibilityMap,
    elementDependencies,
  };
};
