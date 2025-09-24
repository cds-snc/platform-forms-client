import { type TemplateStore } from "../../types";
import { type FormElement, type FormProperties } from "@gcforms/types";
import { cleanRules } from "@gcforms/core";
import { logMessage } from "@lib/logger";
import { v4 as uuid } from "uuid";
import { initializeGroups } from "@root/lib/groups/utils/initializeGroups";

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
    if (state.form.groupsLayout) {
      // Remove start and end if they exist
      state.form.groupsLayout = state.form.groupsLayout.filter(
        (id) => !["start", "end", "review"].includes(id)
      );

      // Ensure all group ids exist in form.groups
      state.form.groupsLayout = state.form.groupsLayout.filter((id) =>
        Object.entries(state.form.groups || {}).some(([key, _group]) => key === id)
      );
    }

    // Clean form layout
    if (state.form.layout) {
      state.form.layout = state.form.layout.filter((id) =>
        state.form.elements.some((element) => element.id === id)
      );
    }
  });
};
