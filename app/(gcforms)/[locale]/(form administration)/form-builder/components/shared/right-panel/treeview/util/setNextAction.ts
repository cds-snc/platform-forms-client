import { GroupsType, NextActionRule, Group } from "@lib/formContext";

/**
 * Autoflow: Set nextAction for all groups **if the nextAction has not already been set**.
 * You may optionally `force` an update to all groups.
 *
 * @param formGroups
 * @param force
 * @returns New groups object
 */
export const autoFlowAllNextActions = (formGroups: GroupsType, force: boolean = false) => {
  const keys = Object.keys(formGroups);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    // Set the nextAction if there is no next group
    if (force || !formGroups[key].nextAction || formGroups[key].nextAction === "") {
      formGroups[key] = {
        ...formGroups[key],
        nextAction: nextKey,
        autoFlow: true,
      };
    }
  }

  return formGroups;
};

/**
 * Check if any of the groups have custom rules set.
 * @param items
 * @returns boolean
 */
export const groupsHaveCustomRules = (items: Group[]) => {
  return items.some((item) => Object.hasOwn(item, "autoFlow") && !item.autoFlow);
};

/**
 * Autoflow: set the nextAction for both the provided groupId and the previous group
 * in the object to maintain a linear flow.
 *
 * @param formGroups
 * @param groupId
 * @returns New groups object
 */
export const autoFlowGroupNextActions = (formGroups: GroupsType, groupId: string) => {
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
    autoFlow: true,
  };

  const prevKey = keys[index - 1];

  if (prevKey) {
    newGroups[prevKey] = {
      ...newGroups[prevKey],
      nextAction: groupId,
      autoFlow: true,
    };
  }

  return newGroups;
};

/**
 * Set the nextAction for a specific group. The nextAction is the key of the next
 * group in the formGroups object.
 *
 * @param formGroups
 * @param groupId
 * @param nextAction
 * @returns Updated nextAction
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
