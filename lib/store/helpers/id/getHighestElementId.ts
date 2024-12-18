import { type TemplateStore } from "../../types";

export const getHighestElementId: TemplateStore<"getHighestElementId"> = (set, get) => () => {
  if (!get) {
    throw new Error("get is not defined");
  }
  const validIds = get()
    .form.elements.filter(
      (element) => element && typeof element.id === "number" && !isNaN(element.id)
    )
    .map((element) => Number(element.id));

  return validIds.length > 0 ? Math.max(...validIds) : 0;
};
