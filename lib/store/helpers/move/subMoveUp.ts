import { TemplateStoreState, SetStateFunction } from "../../types";
import { moveElementUp } from "@lib/utils/form-builder";
import { getParentIndex } from "@lib/utils/form-builder/getPath";

type SubMoveUpType = (set: SetStateFunction) => TemplateStoreState["subMoveUp"];

export const subMoveUp: SubMoveUpType = (set) => (elId, subIndex) =>
  set((state) => {
    const parentIndex = getParentIndex(elId, state.form.elements);

    if (parentIndex === undefined) return;

    const elements = state.form.elements[parentIndex].properties.subElements;

    if (elements) {
      state.form.elements[parentIndex].properties.subElements = moveElementUp(elements, subIndex);
    }
  });
