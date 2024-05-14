import { GroupsType, NextActionRule, Group } from "@lib/formContext";

/*
  This function "auto" sets the nextAction for each group
  The nextAction is the key of the next group in the formGroups object
  This is used to navigate between groups in the form builder
*/
export const autoSetNextAction = (formGroups: GroupsType, force: boolean = false) => {
  const keys = Object.keys(formGroups);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    // Set the nextAction if there is no next group
    if (force || !formGroups[key].nextAction || formGroups[key].nextAction === "") {
      formGroups[key] = {
        ...formGroups[key],
        nextAction: nextKey,
      };
    }
  }

  return formGroups;
};

/*
 * When adding a new group, set the nextAction for both the new group and the previous group
 */
export const autoSetGroupNextAction = (formGroups: GroupsType, groupId: string) => {
  const keys = Object.keys(formGroups);
  const index = keys.indexOf(groupId);
  const newGroups = { ...formGroups };

  if (index === -1) {
    return formGroups;
  }

  const nextKey = keys[index + 1];

  newGroups[groupId] = {
    ...newGroups[groupId],
    nextAction: nextKey,
  };

  const prevKey = keys[index - 1];

  if (prevKey) {
    newGroups[prevKey] = {
      ...newGroups[prevKey],
      nextAction: groupId,
    };
  }

  return newGroups;
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
  const currentAction = formGroups[groupId].nextAction;

  if (currentAction === nextAction) {
    return currentAction;
  }

  if (Array.isArray(nextAction)) {
    const filteredActions: (string | NextActionRule)[] = [];

    nextAction.forEach((action) => {
      // Does it have choiceId and groupId
      const choiceId = action.choiceId;
      const nextGroupId = action.groupId;

      if (choiceId && nextGroupId && nextGroupId !== "") {
        filteredActions.push(action);
      }

      // If it only has groupId than add it as a string
      if (!choiceId && nextGroupId) {
        filteredActions.push(nextGroupId);
      }
    });

    // If the array length is 0, then set the nextAction to an empty string
    if (filteredActions.length === 0) {
      nextAction = "";
    }

    if (filteredActions.length === 1 && typeof filteredActions[0] === "string") {
      nextAction = filteredActions[0];
    }

    if (filteredActions.length > 1) {
      nextAction = filteredActions as NextActionRule[];
    }
  }

  return nextAction;
};
