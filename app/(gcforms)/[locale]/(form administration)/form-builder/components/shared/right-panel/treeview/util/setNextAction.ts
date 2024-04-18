import { GroupsType, Group } from "@lib/formContext";

/*
  This function "auto" sets the nextAction for each group
  The nextAction is the key of the next group in the formGroups object
  This is used to navigate between groups in the form builder
*/
export const autoSetNextAction = (formGroups: GroupsType) => {
  const keys = Object.keys(formGroups);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    // Set the nextAction if there is no next group
    if (!formGroups[key].nextAction || formGroups[key].nextAction === "") {
      formGroups[key].nextAction = nextKey;
    }
  }

  return formGroups;
};

/*
  This function sets the nextAction for a specific group
  The nextAction is the key of the next group in the formGroups object
*/
export const setGroupNextAction = (
  formGroups: GroupsType,
  groupId: string,
  nextAction: Group["nextAction"]
) => {
  formGroups[groupId].nextAction = nextAction;
  return formGroups;
};
