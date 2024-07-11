import { GroupsType } from "@lib/formContext";

export const orderGroups = (groups: GroupsType, groupsLayout: string[]) => {
  if (!groupsLayout || groupsLayout.length <= 0 || !groups) {
    return groups;
  }

  const groupsWithLayout = {} as GroupsType;

  if (groups.start) {
    groupsWithLayout.start = groups.start;
  }

  // Set group properties in the order of the groupsLayout
  groupsLayout.forEach((groupId) => {
    if (groups && groups[groupId]) {
      groupsWithLayout[groupId] = groups[groupId];
    }
  });

  if (groups.review) {
    groupsWithLayout.review = groups.review;
  }

  if (groups.end) {
    groupsWithLayout.end = groups.end;
  }

  return groupsWithLayout;
};
