import { type TemplateStore } from "../../types";

export const getChoice: TemplateStore<"getChoice"> = (set, get) => (elId, choiceIndex) => {
  if (!get) {
    throw new Error("get is not defined");
  }

  const elIndex = get().form.elements.findIndex((el) => el.id === elId);
  return get().form.elements[elIndex]?.properties.choices?.[choiceIndex];
};
