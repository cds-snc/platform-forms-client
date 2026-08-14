import { type TemplateStore } from "../../types";
import { FormElementTypes, type FormElement, type FormProperties } from "@gcforms/types";
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

const updateNumberInputType = (element: FormElement) => {
  if (
    element.type === FormElementTypes.textField &&
    element.properties.validation?.type === "number"
  ) {
    element.type = FormElementTypes.numberInput;
  }
};

const cleanFormStructure = (form: FormProperties) => {
  // Make sure groups exist before we use them to decide which elements are valid.
  const cleanedForm = initializeGroups({ ...form }, true);

  // Clean groupsLayout
  if (cleanedForm.groupsLayout && cleanedForm.groupsLayout.length > 0) {
    cleanedForm.groupsLayout = cleanedForm.groupsLayout.filter((id) => !lockedGroups.includes(id));

    cleanedForm.groupsLayout = cleanedForm.groupsLayout.filter((id) =>
      Object.prototype.hasOwnProperty.call(cleanedForm.groups || {}, id)
    );
  } else {
    cleanedForm.groupsLayout = Object.entries(cleanedForm.groups || {})
      .filter(([id, _group]) => {
        return !lockedGroups.includes(id);
      })
      .map(([id, _group]) => id);
  }

  // Remove any elements that are not in a group.
  const elementIdsInGroups = new Set<string>();

  Object.values(cleanedForm.groups || {}).forEach((group) => {
    group.elements.forEach((elementId) => {
      elementIdsInGroups.add(elementId);
    });
  });

  cleanedForm.elements = cleanedForm.elements.filter((element) => {
    return elementIdsInGroups.has(element.id.toString());
  });

  // Keep layout in sync with elements.
  if (cleanedForm.layout) {
    cleanedForm.layout = cleanedForm.layout.filter((id) =>
      cleanedForm.elements.some((element) => element.id === id)
    );
  }

  return cleanedForm;
};

const cleanElements = (form: FormProperties) => {
  form.elements.forEach((element) => {
    cleanElementRules(form.elements, element);
    ensureUUID(element);
    updateNumberInputType(element);
  });
};

export const transformFormProperties = (form?: FormProperties): FormProperties => {
  if (!form) {
    return {} as FormProperties;
  }

  const transformedForm = JSON.parse(JSON.stringify(form)) as FormProperties;
  const cleanedForm = cleanFormStructure(transformedForm);
  cleanElements(cleanedForm);

  return cleanedForm;
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
    state.form = cleanFormStructure(state.form);

    // Clean rules and ensure UUIDs
    state.form.elements.forEach((element, index) => {
      if (element.uuid === undefined) {
        state.form.elements[index] = { ...element, uuid: uuid() };
      }

      const rules = hasCleanedRules(state.form.elements, state.form.elements[index]);

      if (rules) {
        state.form.elements[index].properties.conditionalRules = rules;
      }
    });
  });
};
