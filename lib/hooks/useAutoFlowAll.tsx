import { autoFlowAllNextActions } from "@root/lib/groups/utils/setNextAction";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { GroupsType } from "@gcforms/types";
import { groupsHaveCustomRules } from "@root/lib/groups/utils/setNextAction";

export const useAutoFlowIfNoCustomRules = () => {
  const { getGroups, replaceGroups } = useGroupStore((s) => {
    return {
      getGroups: s.getGroups,
      replaceGroups: s.replaceGroups,
    };
  });

  const autoFlowAll = () => {
    const groups = getGroups() as GroupsType;
    const hasCustomRules = groupsHaveCustomRules(Object.values(groups));

    if (!hasCustomRules) {
      const newGroups = autoFlowAllNextActions({ ...groups }, true);
      replaceGroups(newGroups);
    }
  };

  return { autoFlowAll };
};
