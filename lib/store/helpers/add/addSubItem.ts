import { type TemplateStore } from "../../types";
import { FormElementTypes, FormElement, ElementProperties } from "@lib/types";
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
        const { subElements, ...rest } =
          subDefaultField.properties as ElementProperties<"dynamicRow">;
        subDefaultField.properties = rest;

        const parentProperties = state.form.elements[parentIndex]
          .properties as ElementProperties<"dynamicRow">;

        const id = incrementSubElementId(
          parentProperties.subElements || [],
          state.form.elements[parentIndex].id
        );

        // caller is responsible for keeping `type` and `data.properties` consistent
        parentProperties.subElements?.splice(subIndex + 1, 0, {
          ...subDefaultField,
          ...data,
          id,
          type,
        } as FormElement);

        resolve(id);
      });
    });
  };
