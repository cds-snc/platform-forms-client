import { type TemplateStore } from "../../types";
import { ElementProperties } from "@lib/types";

export const getChoice: TemplateStore<"getChoice"> = (set, get) => (elId, choiceIndex) => {
  if (!get) {
    throw new Error("get is not defined");
  }

  const elIndex = get().form.elements.findIndex((el) => el.id === elId);
  const properties = get().form.elements[elIndex]?.properties as
    ElementProperties<"dropdown"> | undefined;
  return properties?.choices?.[choiceIndex];
};
