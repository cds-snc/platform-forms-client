import { type FormProperties, type GroupsType } from "@gcforms/types";

export function formHasGroups(form: FormProperties) {
  if (!form || !form.groups) return false;
  return form.groups && Object.keys(form.groups).length > 0;
}

export const orderGroups = (groups?: GroupsType, groupsLayout?: string[]) => {
  if (!groupsLayout || groupsLayout.length <= 0 || !groups) {
    return groups;
  }

  const groupsWithLayout = {} as GroupsType;

  if (groups.start) {
    groupsWithLayout.start = groups.start;
  }

  groupsLayout.forEach((groupId) => {
    if (groups[groupId]) {
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
