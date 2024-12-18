import { type TemplateStore } from "../../types";

export const generateElementId: TemplateStore<"generateElementId"> = (set, get) => () => {
  if (!get) {
    throw new Error("get is not defined");
  }
  set((state) => {
    const lastId = state.form.lastGeneratedElementId || 0;

    // Ensure backwards compatibility with existing forms
    const highestId = state.getHighestElementId();

    if (lastId < highestId) {
      state.form.lastGeneratedElementId = highestId + 1;
      return;
    }

    state.form.lastGeneratedElementId = lastId + 1;
  });

  return get().form.lastGeneratedElementId || 1;
};
