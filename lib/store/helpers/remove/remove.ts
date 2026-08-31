import { original } from "immer";
import { type TemplateStore } from "../../types";
import { removeElementById, removeById, removeGroupElement } from "@lib/utils/form-builder";

export const remove: TemplateStore<"remove"> =
  (set) =>
  (elementId, groupId = "") => {
    set((state) => {
      state.form.elements = removeElementById(state.form.elements, elementId);
      state.form.layout = removeById(state.form.layout, elementId);

      if (groupId && state.form.groups) {
        const groups = removeGroupElement({ ...original(state.form.groups) }, groupId, elementId);
        state.form.groups = { ...groups };
      }
    });
  };
