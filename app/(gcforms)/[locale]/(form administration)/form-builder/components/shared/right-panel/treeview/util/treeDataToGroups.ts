import { TreeItem } from "../types";
import { GroupsType } from "@lib/formContext";

export const treeDataToGroups = (treeData: TreeItem[]): GroupsType => {
  const groups: GroupsType = {};
  treeData.forEach((group) => {
    const elements =
      (group.children
        ?.map((el) => {
          return String(el.id);
        })
        .filter((el) => el !== undefined) as string[]) || [];

    groups[group.id] = { name: group.name, elements: [...new Set(elements)] };
  });
  return groups;
};
