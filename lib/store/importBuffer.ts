import { FormProperties } from "@lib/types";

let importedTemplate: FormProperties | null = null;

export const setImportedTemplate = (template: FormProperties | null) => {
  importedTemplate = template;
};

export const getImportedTemplate = (): FormProperties | null => {
  const template = importedTemplate;
  importedTemplate = null;
  return template;
};
