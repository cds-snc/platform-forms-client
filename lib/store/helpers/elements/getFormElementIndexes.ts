import { type TemplateStore } from "../../types";

import { getElementIndexes } from "@lib/utils/form-builder/getPath";

export const getFormElementIndexes: TemplateStore<"getFormElementIndexes"> = (set, get) => (id) => {
  if (!get) {
    throw new Error("get is not defined");
  }

  const elements = get().form.elements;

  return getElementIndexes(id, elements);
};
