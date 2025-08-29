import { useCallback } from "react";
import { v4 as uuid } from "uuid";

import { TreeInstance, ItemInstance } from "@headless-tree/core";

import { GroupsType } from "@gcforms/types";
import { useTranslation } from "@i18n/client";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

import { findParentGroup } from "../treeview/util/findParentGroup";

import { autoFlowGroupNextActions } from "../treeview/util/setNextAction";
import { TreeItem } from "react-complex-tree";

/**
 * Custom hook to sync tree state with external store
 * This ensures the tree rebuilds whenever the underlying data changes
 * while preserving the expanded/selected state and syncing selection with store
 */
export const useTreeSync = <T>(tree: TreeInstance<T>) => {
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
    tree.rebuildTree();
    tree.setSelectedItems([id]);

    // Start renaming the newly created item
    // We need to wait a bit for the tree to rebuild and the item to be available
    setTimeout(() => {
      try {
        const newItem = tree.getItemInstance(id);
        if (newItem && typeof newItem.startRenaming === "function") {
          newItem.startRenaming();
        }
      } catch (error) {
        // Ignore if item not found or renaming fails
      }
    }, 0);
  }, [addGroup, getGroups, newSectionText, replaceGroups, setId, tree]);

  const onFocusItem = useCallback(
    (item: ItemInstance<TreeItem>) => {
      const id = item.getId();
      const data = item.getItemData().data;
      const parent = findParentGroup(getTreeData(), id);

      if (data.type === "dynamicRow") {
        setId(String(parent?.index));
        return;
      }

      if (data.isSubElement) {
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

      setId(item.isFolder() ? id : String(parent?.index));
    },
    [getTreeData, setId]
  );

  return { addPage, onFocusItem };
};
