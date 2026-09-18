import { LOCKED_GROUPS } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";
import { GroupsType } from "@gcforms/types";

export const resetReviewEndNextAction = (formGroups: GroupsType) => {
  if (formGroups[LOCKED_GROUPS.END].nextAction) {
    delete formGroups[LOCKED_GROUPS.END].nextAction;
  }

  formGroups[LOCKED_GROUPS.REVIEW] = {
    ...formGroups[LOCKED_GROUPS.REVIEW],
    nextAction: "end",
  };

  const keys = Object.keys(formGroups);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (key !== LOCKED_GROUPS.REVIEW && formGroups[key].nextAction === LOCKED_GROUPS.END) {
      formGroups[key].nextAction = LOCKED_GROUPS.REVIEW;
    }
  }

  return formGroups;
};
