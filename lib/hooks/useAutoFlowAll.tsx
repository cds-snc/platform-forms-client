import { autoFlowAllNextActions } from "@formBuilder/components/shared/right-panel/treeview/util/setNextAction";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { GroupsType } from "@lib/formContext";
import { groupsHaveCustomRules } from "@formBuilder/components/shared/right-panel/treeview/util/setNextAction";

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
