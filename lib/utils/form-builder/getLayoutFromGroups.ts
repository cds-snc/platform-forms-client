import { Group, GroupsType } from "@lib/formContext";

export const getLayoutFromGroups = (groups: GroupsType) => {
  const layout: number[] = [];
  // loop over each group and it elements array and push the elements id to the layout array
  for (const key in groups) {
    if (Object.prototype.hasOwnProperty.call(groups, key)) {
      const group: Group = groups[key];
      group.elements.forEach((element: string) => {
        layout.push(Number(element));
      });
    }
  }

  return layout;
};
