import { FormProperties } from "@lib/types";
import { autoFlowAllNextActions, groupsHaveCustomRules } from "@lib/groups/utils/setNextAction";
import { orderGroups } from "./orderUsingGroupsLayout";

export const autoFlowFormIfPossible = (formConfig: FormProperties): FormProperties => {
  const groups = formConfig.groups;

  if (!groups || !formConfig.groupsLayout?.length || groupsHaveCustomRules(Object.values(groups))) {
    return formConfig;
  }

  const orderedGroups = orderGroups(groups, formConfig.groupsLayout);

  if (!orderedGroups) {
    return formConfig;
  }

  return {
    ...formConfig,
    groups: autoFlowAllNextActions({ ...orderedGroups }, true),
  };
};
