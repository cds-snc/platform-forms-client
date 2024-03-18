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
