import { TemplateStoreState, SetStateFunction } from "../../types";
import { moveUp as moveElementUp } from "@lib/utils/form-builder";

type MoveUpType = (set: SetStateFunction) => TemplateStoreState["moveUp"];

export const moveUp: MoveUpType = (set) => (elIndex, groupId) =>
  set((state) => {
    state.form.layout = moveElementUp(state.form.layout, elIndex);
    const allowGroups = state.allowGroupsFlag;
    if (allowGroups && groupId) {
      const group = state.form.groups && state.form.groups[groupId];
      if (group) {
        // Convert the elements array to a number array
        const els = group.elements.map((el) => Number(el));
        // Move the element up and convert back to string array
        group.elements = moveElementUp(els, elIndex).map((el) => String(el));
      }
    }
  });
