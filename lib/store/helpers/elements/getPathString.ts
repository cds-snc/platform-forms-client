import { type TemplateStore } from "../../types";
import { getPathString as pathString } from "@lib/utils/form-builder/getPath";

export const getPathString: TemplateStore<"getPathString"> = (set, get) => (id) => {
  if (!get) {
    throw new Error("get is not defined");
  }
  return pathString(id, get().form.elements);
};
