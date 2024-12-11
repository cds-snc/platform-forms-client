import { TemplateStoreState, SetStateFunction } from "../../types";
import { moveElementDown } from "@lib/utils/form-builder";
import { getParentIndex } from "@lib/utils/form-builder/getPath";

type SubMoveDownType = (set: SetStateFunction) => TemplateStoreState["subMoveDown"];

export const subMoveDown: SubMoveDownType =
  (set) =>
  (elId, subIndex = 0) =>
    set((state) => {
      const parentIndex = getParentIndex(elId, state.form.elements);

      if (parentIndex === undefined) return;

      const elements = state.form.elements[parentIndex].properties.subElements;

      if (elements) {
        state.form.elements[parentIndex].properties.subElements = moveElementDown(
          elements,
          subIndex
        );
      }
    });
