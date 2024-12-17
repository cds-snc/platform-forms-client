import { type TemplateStore } from "../../types";

export const addChoice: TemplateStore<"addChoice"> = (set) => (elIndex) =>
  set((state) => {
    state.form.elements[elIndex].properties.choices?.push({ en: "", fr: "" });
  });
