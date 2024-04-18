import { GroupsType } from "@lib/formContext";

/*
  This function "auto" sets the nextAction for each group
  The nextAction is the key of the next group in the formGroups object
  This is used to navigate between groups in the form builder
*/
export const setNextAction = (formGroups: GroupsType) => {
  const keys = Object.keys(formGroups);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    formGroups[key].nextAction = nextKey;
  }

  return formGroups;
};
