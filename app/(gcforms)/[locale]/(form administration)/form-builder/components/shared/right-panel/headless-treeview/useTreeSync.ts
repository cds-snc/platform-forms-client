import { useEffect, useRef } from "react";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { TreeController } from "@headless-tree/core";
import { elementIdToTreeId } from "./treeUtils";

/**
 * Custom hook to sync tree state with external store
 * This ensures the tree rebuilds whenever the underlying data changes
 * while preserving the expanded/selected state and syncing selection with store
 */
export const useTreeSync = (tree: TreeController) => {
  // Subscribe to selection changes and groups changes via the group store
  const { selectedElementId, groups } = useGroupStore((s) => ({
    selectedElementId: s.selectedElementId,
    groups: s.getGroups(),
  }));

  // Sync selection from store to tree
  useEffect(() => {
    if (selectedElementId !== undefined) {
      // Safety check: ensure tree is initialized
      if (!tree || typeof tree.setSelectedItems !== "function") {
        return;
      }

      const currentSelection = tree.getState().selectedItems;
      const expectedSelection = [elementIdToTreeId(selectedElementId)];

      // Only update if selection actually changed
      if (JSON.stringify(currentSelection) !== JSON.stringify(expectedSelection)) {
        tree.setSelectedItems(expectedSelection);
      }
    }
  }, [selectedElementId, tree]);

  // Listen for changes in groups specifically
  const groupsRef = useRef(groups);

  useEffect(() => {
    // If groups changed, rebuild the tree
    if (groups !== groupsRef.current) {
      groupsRef.current = groups;

      // Safety check: ensure tree is initialized
      if (!tree || typeof tree.rebuildTree !== "function") {
        return;
      }

      // Preserve current state before rebuilding
      const currentState = tree.getState();
      const expandedItems = currentState.expandedItems;
      const selectedItems = currentState.selectedItems;

      tree.rebuildTree();

      // Restore expanded/selected state after rebuild
      setTimeout(() => {
        if (tree.setExpandedItems && expandedItems.length > 0) {
          tree.setExpandedItems(expandedItems);
        }
        if (tree.setSelectedItems && selectedItems.length > 0) {
          tree.setSelectedItems(selectedItems);
        }
      }, 0);
    }
  }, [groups, tree]);
};
