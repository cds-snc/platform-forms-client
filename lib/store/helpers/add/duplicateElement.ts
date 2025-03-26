import { FormElement } from "@gcforms/types";
import { type TemplateStore } from "../../types";

export const duplicateElement: TemplateStore<"duplicateElement"> =
  (set, get) =>
  (itemId, groupId = "", copyEn = "", copyFr = "") => {
    if (!get) {
      throw new Error("get is not defined");
    }

    const elIndex = get().form.elements.findIndex((el) => el.id === itemId);
    const id = get().generateElementId();
    set((state) => {
      // deep copy the element
      const element = JSON.parse(JSON.stringify(state.form.elements[elIndex]));

      element.id = id;
      if (element.type !== "richText" && element.properties["titleEn"]) {
        element.properties["titleEn"] = `${element.properties["titleEn"]} ${copyEn}`;
      }
      if (element.type !== "richText" && element.properties["titleFr"]) {
        element.properties["titleFr"] = `${element.properties["titleFr"]} ${copyFr}`;
      }

      // Renumber sub elements so they match the new parentId
      if (element.type === "dynamicRow") {
        const subElementId = Number(element.id.toString() + "01");
        element.properties.subElements.forEach((subElement: FormElement, index: number) => {
          subElement.id = index === 0 ? subElementId : subElementId + index;
        });
      }

      state.form.elements.splice(elIndex + 1, 0, element);
      state.form.layout.splice(elIndex + 1, 0, id);

      // Handle groups
      const allowGroups = state.allowGroupsFlag;
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
        state.form.groups && state.form.groups[groupId].elements.splice(elIndex + 1, 0, String(id));
      }
      // end groups
    });
  };
