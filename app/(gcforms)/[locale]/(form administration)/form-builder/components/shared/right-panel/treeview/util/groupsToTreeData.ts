import { GroupsType } from "@lib/formContext";
import { TreeItems } from "../types";

export const groupsToTreeData = (formGroups: GroupsType): TreeItems => {
  const items: TreeItems = {
    root: {
      index: "root",
      data: "Root",
      children: [],
    },
  };

  if (formGroups) {
    for (const [key, value] of Object.entries(formGroups)) {
      // @todo --- we should validate the element exists in the form elements
      const children =
        value.elements &&
        value.elements.map((id) => {
          // if (id === "-1") {
          //   return {
          //     id: "introduction",
          //     name: "Introduction",
          //     readOnly: true,
          //   };
          // }

          // if (id === "-2") {
          //   return {
          //     id: "privacy",
          //     name: "Privacy",
          //     readOnly: true,
          //   };
          // }

          // if (id === "-3") {
          //   return {
          //     id: "confirmation",
          //     name: "Confirmation",
          //     readOnly: true,
          //   };
          // }
          //       index: "root",
          // canMove: true,
          // isFolder: true,
          // children: ["start", "child2"],
          // data: "Root item",
          // canRename: true,

          return id;
        });

      if (!children) continue;

      const item = {
        index: key,
        isFolder: true,
        canRename: true,
        canMove: true,
        data: formGroups[key].name,
        children: [],
      };

      items[key] = item;
      items.root.children?.push(key);
    }
  }

  return items;
};
