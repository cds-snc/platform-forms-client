import { GroupsType } from "@lib/formContext";
import { TreeItems } from "../types";
import { FormElement } from "@lib/types";

export const groupsToTreeData = (formGroups: GroupsType, elements: FormElement[]): TreeItems => {
  const items: TreeItems = {
    root: {
      index: "root",
      data: "Root",
      children: [],
    },
  };

  if (!formGroups) {
    return items;
  }

  for (const [key, value] of Object.entries(formGroups)) {
    const children =
      value.elements &&
      value.elements.map((id) => {
        return id;
      });

    if (!children) continue;

    const item = {
      index: key,
      isFolder: true,
      canRename: true,
      canMove: true,
      data: formGroups[key].name,
      children: children,
    };

    items[key] = item;
    items.root.children?.push(key);

    children.forEach((childId) => {
      const element = elements.find((el) => el.id === Number(childId));
      if (!element) return;

      const childItem = {
        index: childId,
        isFolder: false,
        canRename: true,
        canMove: true,
        data: element.properties.titleEn, // @TODO
      };

      items[childId] = childItem;
    });
  }

  return items;
};
