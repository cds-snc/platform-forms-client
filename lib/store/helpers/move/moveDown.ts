import { type TemplateStore } from "../../types";
import { moveDown as moveElementDown } from "@lib/utils/form-builder";

export const moveDown: TemplateStore<"moveDown"> = (set) => (elIndex, groupId) =>
  set((state) => {
    state.form.layout = moveElementDown(state.form.layout, elIndex);
    const allowGroups = state.allowGroupsFlag;
    if (allowGroups && groupId) {
      const group = state.form.groups && state.form.groups[groupId];
      if (group) {
        // Convert the elements array to a number array
        const els = group.elements.map((el) => Number(el));
        // Move the element down and convert back to string array
        group.elements = moveElementDown(els, elIndex).map((el) => String(el));
      }
    }
  });
