import { TreeItem } from "../types";
import { GroupsType } from "@lib/formContext";

export const groupsToTreeData = (formGroups: GroupsType): TreeItem[] => {
  const items = [];
  if (formGroups) {
    for (const [key, value] of Object.entries(formGroups)) {
      // @todo --- we should validate the element exists in the form elements
      const children =
        value.elements &&
        value.elements.map((id) => {
          if (id === "-1") {
            return {
              id: "introduction",
              name: "Introduction",
              readOnly: true,
            };
          }

          if (id === "-2") {
            return {
              id: "privacy",
              name: "Privacy",
              readOnly: true,
            };
          }

          if (id === "-3") {
            return {
              id: "confirmation",
              name: "Confirmation",
              readOnly: true,
            };
          }

          return {
            id: id,
            name: "",
            readOnly: false,
          };
        });

      if (!children) continue;

      const item = {
        id: key,
        name: formGroups[key].name,
        readOnly: false,
        children: children.filter((el) => el !== undefined) as TreeItem[],
      };

      items.push(item);
    }
  }

  return items;
};
