import { useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { findParentGroup } from "@lib/groups/utils/findParentGroup";

// Type for tree item with minimal required methods
type TreeItem = {
  getId: () => string;
  getItemData: () => unknown;
  isFolder: () => boolean;
};

export const useTreeHandlers = () => {
  const { t } = useTranslation("form-builder");
  const newSectionText = t("groups.newPage");

  const { setId, addGroup, getTreeData } = useGroupStore((s) => ({
    setId: s.setId,
    addGroup: s.addGroup,
    getTreeData: s.getTreeData,
  }));

  // Keep track of groups changes to trigger sync
  const addPage = useCallback(() => {
    const id = addGroup(newSectionText);

    setId(id);

    return id;
  }, [addGroup, newSectionText, setId]);

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
