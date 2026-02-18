import { type TemplateStore } from "../../types";
import { type FormElement, type FormProperties } from "@gcforms/types";
import { cleanRules } from "@gcforms/core";
import { logMessage } from "@lib/logger";
import { v4 as uuid } from "uuid";
import { initializeGroups } from "@root/lib/groups/utils/initializeGroups";
import { lockedGroups } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";

const cleanElementRules = (elements: FormElement[], element: FormElement) => {
  if (element.properties?.conditionalRules) {
    const elementRules = element.properties.conditionalRules;
    const updatedRules = cleanRules(elements, elementRules);

    if (updatedRules.length !== elementRules.length) {
      logMessage.info(
        `cleaned rules:${JSON.stringify(elementRules)} -> ${JSON.stringify(updatedRules)}`
      );
      element.properties.conditionalRules = updatedRules;
    }
  }
};

const ensureUUID = (element: FormElement) => {
  if (element.uuid === undefined) {
    element.uuid = uuid();
  }
};

export const transformFormProperties = (form?: FormProperties): FormProperties => {
  if (!form) {
    return {} as FormProperties;
  }

  const transformedForm = JSON.parse(JSON.stringify(form)) as FormProperties;

  transformedForm.elements.forEach((element) => {
    cleanElementRules(transformedForm.elements, element);
    ensureUUID(element);
  });

  return transformedForm;
};

export const hasCleanedRules = (elements: FormElement[], element: FormElement) => {
  if (element.properties?.conditionalRules) {
    const elementRules = element.properties.conditionalRules;
    const updatedRules = cleanRules(elements, elementRules);

    if (updatedRules.length !== elementRules.length) {
      return updatedRules;
    }
  }

  return;
};

export const transform: TemplateStore<"transform"> = (set) => () => {
  set((state) => {
    // Make sure groups are initialized
    state.form = initializeGroups({ ...state.form }, true);

    // Clean rules and ensure UUIDs
    state.form.elements.forEach((element, index) => {
      if (element.uuid === undefined) {
        state.form.elements[index] = { ...element, uuid: uuid() };
      }

      const rules = hasCleanedRules(state.form.elements, element);

      if (rules) {
        state.form.elements[index].properties.conditionalRules = rules;
      }
    });

    // Clean groupsLayout
    if (state.form.groupsLayout && state.form.groupsLayout.length > 0) {
      // Remove locked groups (start, end, review) if they exist
      state.form.groupsLayout = state.form.groupsLayout.filter((id) => !lockedGroups.includes(id));

      // Ensure all group ids exist in form.groups
      state.form.groupsLayout = state.form.groupsLayout.filter((id) =>
        Object.entries(state.form.groups || {}).some(([key, _group]) => key === id)
      );
    } else {
      // Create a groupsLayout if it's missing or empty
      state.form.groupsLayout = Object.entries(state.form.groups || {})
        .filter(([id, _group]) => {
          return !lockedGroups.includes(id);
        })
        .map(([id, _group]) => id);
    }

    // Clean elements array based on groups (only those in groups are kept)
    const elementIdsInGroups = new Set<string>();

    Object.values(state.form.groups || {}).forEach((group) => {
      group.elements.forEach((elementId) => {
        elementIdsInGroups.add(elementId);
      });
    });

    state.form.elements = state.form.elements.filter((element) => {
      // ensure element.id exists in any elements array in the groups object
      return elementIdsInGroups.has(element.id.toString());
    });

    // Clean form layout
    if (state.form.layout) {
      state.form.layout = state.form.layout.filter((id) =>
        state.form.elements.some((element) => element.id === id)
      );
    }
  });
};
