import { FormElement, FormProperties } from "@gcforms/types";
import { cleanRules } from "@lib/formContext";
import { logMessage } from "@lib/logger";
import { v4 as uuid } from "uuid";

export type transformFormPropertiesOptions = {
  cleanRules: boolean;
};

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

const ensureUUID = (element: FormElement) => {
  if (element.uuid === undefined) {
    element.uuid = uuid();
  }
};

export const transformFormProperties = (
  form?: FormProperties,
  options?: transformFormPropertiesOptions
): FormProperties => {
  if (!form) {
    return {} as FormProperties;
  }

  const transformedForm = JSON.parse(JSON.stringify(form)) as FormProperties;

  transformedForm.elements.forEach((element) => {
    if (options && options.cleanRules) {
      cleanElementRules(transformedForm.elements, element);
    }
    ensureUUID(element);
  });

  return transformedForm;
};
