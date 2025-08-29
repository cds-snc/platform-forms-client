import { useCallback, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";

import { TreeInstance, ItemInstance } from "@headless-tree/core";

import { GroupsType } from "@gcforms/types";
import { useTranslation } from "@i18n/client";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { elementIdToTreeId } from "./treeUtils";

import { autoFlowGroupNextActions } from "../treeview/util/setNextAction";

/**
 * Custom hook to sync tree state with external store
 * This ensures the tree rebuilds whenever the underlying data changes
 * while preserving the expanded/selected state and syncing selection with store
 */
export const useTreeSync = <T>(tree: TreeInstance<T>) => {
  const { t } = useTranslation("form-builder");
  const newSectionText = t("groups.newPage");

  const { setId, selectedElementId, groups, getGroups, addGroup, replaceGroups } = useGroupStore(
    (s) => ({
      setId: s.setId,
      selectedElementId: s.selectedElementId,
      groups: s.getGroups(),
      getGroups: s.getGroups,
      addGroup: s.addGroup,
      replaceGroups: s.replaceGroups,
    })
  );

  // Keep track of groups changes to trigger sync
  const groupsRef = useRef(groups);
  const groupKeysRef = useRef<string[]>([]);

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

  // Focus Item
  const onFocusItem = useCallback((item: ItemInstance<T>) => {
    const id = item.getId();
    // @todo navigate to page
    // eslint-disable-next-line no-console
    console.log(id);
  }, []);

  useEffect(() => {
    // Check if groups structure changed (new/removed groups)
    if (groups !== groupsRef.current) {
      const currentGroupKeys = groups ? Object.keys(groups) : [];
      const previousGroupKeys = groupsRef.current ? Object.keys(groupsRef.current) : [];

      const groupsChanged =
        currentGroupKeys.length !== previousGroupKeys.length ||
        currentGroupKeys.some((key) => !previousGroupKeys.includes(key)) ||
        previousGroupKeys.some((key) => !currentGroupKeys.includes(key));

      if (groupsChanged && tree && typeof tree.rebuildTree === "function") {
        // Groups structure changed (added/removed), rebuild the tree
        try {
          tree.rebuildTree();
        } catch (error) {
          // Ignore rebuild errors - tree will sync on next render
        }
      }

      groupsRef.current = groups;
      groupKeysRef.current = currentGroupKeys;
    }
  }, [groups, tree]);

  // Sync selection from store to tree
  useEffect(() => {
    if (selectedElementId !== undefined && tree && typeof tree.setSelectedItems === "function") {
      try {
        const currentSelection = tree.getState().selectedItems;
        const expectedSelection = [String(elementIdToTreeId(selectedElementId))];

        // Only update if selection actually changed
        if (JSON.stringify(currentSelection) !== JSON.stringify(expectedSelection)) {
          tree.setSelectedItems(expectedSelection);
        }
      } catch (error) {
        // Ignore selection sync errors
      }
    }
  }, [selectedElementId, tree]);

  return { addPage, onFocusItem };
};
