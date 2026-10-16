import { type FormElement } from "@gcforms/types";
import { isNumberInput } from "@gcforms/core";
import { type TemplateMigration } from "./types";

const removeNullStepCountFromElement = (element: FormElement): FormElement => {
  const properties = { ...element.properties };

  if (isNumberInput(element) && properties.stepCount === null) {
    delete properties.stepCount;
  }

  if (element.type === "dynamicRow" && properties.subElements) {
    properties.subElements = properties.subElements.map(removeNullStepCountFromElement);
  }

  return { ...element, properties };
};

export const removeNullStepCount: TemplateMigration = (template) => ({
  ...template,
  elements: template.elements.map(removeNullStepCountFromElement),
  schemaVersion: 2,
});
