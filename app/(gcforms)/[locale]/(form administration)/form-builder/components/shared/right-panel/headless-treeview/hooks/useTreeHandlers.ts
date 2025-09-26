import { useCallback } from "react";
import { v4 as uuid } from "uuid";

import { GroupsType } from "@gcforms/types";
import { useTranslation } from "@i18n/client";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { findParentGroup } from "@lib/groups/utils/findParentGroup";
import { autoFlowGroupNextActions } from "@lib/groups/utils/setNextAction";

// Type for tree item with minimal required methods
type TreeItem = {
  getId: () => string;
  getItemData: () => unknown;
  isFolder: () => boolean;
};

export const useTreeHandlers = () => {
  const { t } = useTranslation("form-builder");
  const newSectionText = t("groups.newPage");

  const { setId, getGroups, addGroup, replaceGroups, getTreeData } = useGroupStore((s) => ({
    setId: s.setId,
    getGroups: s.getGroups,
    addGroup: s.addGroup,
    replaceGroups: s.replaceGroups,
    getTreeData: s.getTreeData,
  }));

  // Keep track of groups changes to trigger sync
  const addPage = useCallback(() => {
    const id = uuid();
    addGroup(id, newSectionText);
    const newGroups = autoFlowGroupNextActions(getGroups() as GroupsType, id);
    replaceGroups(newGroups);
    setId(id);

    return id;
  }, [addGroup, getGroups, newSectionText, replaceGroups, setId]);

  const setActiveGroup = useCallback(
    (item: TreeItem) => {
      setTimeout(() => {
        const id = item.getId();
        const data = item.getItemData() as Record<string, unknown>;
        const parent = findParentGroup(getTreeData(), id);

        if (data && data.type === "dynamicRow") {
          setId(String(parent?.index));
          return;
        }

        if (data && data.isSubElement) {
          const subParent = findParentGroup(getTreeData(), String(data.parentId));
          setId(String(subParent?.index));
          return;
        }

        if (id === "intro" || id === "policy") {
          setId("start");
          return;
        }

        if (id === "confirmation") {
          setId("end");
          return;
        }

        const toId = item.isFolder() ? id : String(parent?.index);

        setId(toId);
      }, 200);
    },
    [getTreeData, setId]
  );

  return { addPage, setActiveGroup };
};
