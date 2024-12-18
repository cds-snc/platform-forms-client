import { type TemplateStore } from "../../types";
import { FormElementTypes } from "@lib/types";
import { defaultField } from "../../defaults";

export const add: TemplateStore<"add"> =
  (set, get) =>
  (elIndex = 0, type = FormElementTypes.radio, data, groupId) => {
    if (!get) {
      throw new Error("get is not defined");
    }

    const id = get().generateElementId();

    return new Promise((resolve) => {
      set((state) => {
        const allowGroups = state.allowGroupsFlag;

        const item = {
          ...defaultField,
          ...data,
          id,
          type,
        };

        groupId = allowGroups && groupId ? groupId : "";

        if (allowGroups && groupId) {
          if (!state.form.groups) state.form.groups = {};
          if (!state.form.groups[groupId])
            state.form.groups[groupId] = {
              name: "",
              titleEn: "",
              titleFr: "",
              elements: [],
            };
          state.form.groups &&
            state.form.groups[groupId].elements.splice(elIndex + 1, 0, String(id));
        }

        state.form.layout.splice(elIndex + 1, 0, id);
        state.form.elements.splice(elIndex + 1, 0, item);

        resolve(id);
      });
    });
  };
