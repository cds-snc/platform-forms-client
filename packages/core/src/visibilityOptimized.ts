import { FormElement, PublicFormRecord, FormValues } from "@gcforms/types";
import { checkVisibilityRecursive } from "./visibility";
import { getElementById, isChoiceInputType } from "./helpers";

//////////////////////////////////////// TODO ////////////////////////////////////////
// TODO: Need to decide what to do with visibility.ts as it is now mostly legacy.
// This code builds on top of the visibility.ts functions and adds optimizations etc.
//////////////////////////////////////////////////////////////////////////////////////

// Element dependencies map showing which element IDs depend on which other elements
// e.g., { "1": ["3", "5"], "2": ["5"] } means elements 3 and 5 depend on element 1
export type ElementDependencies = Map<string, Set<string>>;

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

    // This element has rules, so it depends on the elements referenced in those rules
    rules.forEach((rule) => {
      const [parentElementId] = rule.choiceId.split(".");

      // Add this element as a dependent of the parent element
      if (!elementDependencies.has(parentElementId)) {
        elementDependencies.set(parentElementId, new Set());
      }
      elementDependencies.get(parentElementId)!.add(element.id.toString());
    });
  });

  return elementDependencies;
};

/**
 * Recursively collects all elements that depend on the given element IDs.
 * This handles chains of dependencies (A depends on B, B depends on C, etc.)
 *
 * @param elementIds - The starting element IDs to check dependencies for
 * @param elementDependencies - The element dependencies map
 * @param visited - Set of already visited element IDs to prevent infinite loops
 * @returns A set of all element IDs that directly or transitively depend on the input elements
 */
export const collectDependentElements = (
  elementIds: string[],
  elementDependencies: ElementDependencies,
  visited: Set<string> = new Set()
): Set<string> => {
  const dependents = new Set<string>();

  elementIds.forEach((elementId) => {
    // Prevent infinite loops in circular dependencies
    if (visited.has(elementId)) return;
    visited.add(elementId);

    // Get direct dependents
    const directDependents = elementDependencies.get(elementId);
    if (directDependents) {
      directDependents.forEach((depId) => {
        dependents.add(depId);
      });

      // Recursively collect transitive dependents
      const transitiveDependents = collectDependentElements(
        Array.from(directDependents),
        elementDependencies,
        visited
      );
      transitiveDependents.forEach((depId) => dependents.add(depId));
    }
  });

  return dependents;
};

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

  formRecord.form.elements.forEach((element) => {
    const isVisible = checkVisibilityRecursive(formRecord, element, values, checked);
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
  const checked: Record<string, boolean> = {};

  // Recompute visibility only for affected elements
  affectedElementIds.forEach((elementId) => {
    const element = getElementById(formRecord.form.elements, elementId);
    if (element) {
      const isVisible = checkVisibilityRecursive(formRecord, element, values, checked);
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

  allKeys.forEach((key) => {
    const oldValue = oldValues[key];
    const newValue = newValues[key];

    // Check if value actually changed
    const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);
    if (!hasChanged) return;

    // Check if this element is a choice-based input
    const element = getElementById(formElements, key);
    if (!element || !isChoiceInputType(element.type)) return;

    // Check if any elements depend on this one
    if (elementDependencies.has(key)) {
      changedIds.push(key);
    }
  });

  return changedIds;
};

// Context value for visibility state management
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
