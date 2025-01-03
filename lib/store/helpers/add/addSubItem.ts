import { type TemplateStore } from "../../types";
import { FormElementTypes } from "@lib/types";
import { defaultField } from "../../defaults";
import { getParentIndex } from "@lib/utils/form-builder/getPath";
import { incrementSubElementId } from "@lib/utils/form-builder";

export const addSubItem: TemplateStore<"addSubItem"> =
  (set) =>
  (elId, subIndex = 0, type = FormElementTypes.radio, data) => {
    return new Promise((resolve) => {
      set((state) => {
        let parentIndex = getParentIndex(elId, state.form.elements);

        if (parentIndex === undefined) {
          parentIndex = 0;
        }

        // remove subElements array property given we're adding a sub item
        const subDefaultField = { ...defaultField };
        const { subElements, ...rest } = subDefaultField.properties;
        subDefaultField.properties = rest;

        const id = incrementSubElementId(
          state.form.elements[parentIndex].properties.subElements || [],
          state.form.elements[parentIndex].id
        );

        state.form.elements[parentIndex].properties.subElements?.splice(subIndex + 1, 0, {
          ...subDefaultField,
          ...data,
          id,
          type,
        });

        resolve(id);
      });
    });
  };
