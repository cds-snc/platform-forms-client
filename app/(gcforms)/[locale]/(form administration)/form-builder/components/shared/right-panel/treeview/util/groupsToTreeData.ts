import { TreeItem } from "../types";
import { GroupsType } from "@lib/formContext";

export const groupsToTreeData = (formGroups: GroupsType): TreeItem[] => {
  const items = [];
  if (formGroups) {
    for (const [key, value] of Object.entries(formGroups)) {
      const children =
        value.elements &&
        value.elements.map((id) => {
          return {
            id: id,
            name: "",
            icon: null,
            readOnly: false,
          };
        });

      if (!children) continue;

      const item = {
        id: key,
        name: formGroups[key].name,
        icon: null,
        readOnly: false,
        children: children.filter((el) => el !== undefined) as TreeItem[],
      };

      items.push(item);
    }
  }

  return items;
};
