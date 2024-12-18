import { type TemplateStore } from "../../types";
import { getPathString } from "@lib/utils/form-builder/getPath";

export const propertyPath: TemplateStore<"propertyPath"> = (set, get) => (id, field, lang) => {
  if (!get) {
    throw new Error("get is not defined");
  }

  const path = getPathString(id, get().form.elements);
  if (lang) {
    return `${path}.${get().localizeField(field, lang)}`;
  }
  return `${path}.${field}`;
};
