import { useEffect, useRef } from "react";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { elementIdToTreeId } from "./treeUtils";

// Define interface for tree methods we need
interface TreeController {
  rebuildTree: () => void;
  setSelectedItems: (items: (string | number)[]) => void;
  getState: () => { selectedItems: string[] };
}

/**
 * Custom hook to sync tree state with external store
 * This ensures the tree rebuilds whenever the underlying data changes
 * while preserving the expanded/selected state and syncing selection with store
 */
export const useTreeSync = (tree: unknown) => {
  // Subscribe to selection changes and groups changes via the group store
  const { selectedElementId, groups } = useGroupStore((s) => ({
    selectedElementId: s.selectedElementId,
    groups: s.getGroups(),
  }));

  // Keep track of groups changes to trigger sync
  const groupsRef = useRef(groups);
  const groupKeysRef = useRef<string[]>([]);

  useEffect(() => {
    // Check if groups structure changed (new/removed groups)
    if (groups !== groupsRef.current) {
      const currentGroupKeys = groups ? Object.keys(groups) : [];
      const previousGroupKeys = groupsRef.current ? Object.keys(groupsRef.current) : [];

      const groupsChanged =
        currentGroupKeys.length !== previousGroupKeys.length ||
        currentGroupKeys.some((key) => !previousGroupKeys.includes(key)) ||
        previousGroupKeys.some((key) => !currentGroupKeys.includes(key));

      if (groupsChanged && tree && typeof (tree as TreeController).rebuildTree === "function") {
        // Groups structure changed (added/removed), rebuild the tree
        try {
          (tree as TreeController).rebuildTree();
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
    if (
      selectedElementId !== undefined &&
      tree &&
      typeof (tree as TreeController).setSelectedItems === "function"
    ) {
      try {
        const treeInstance = tree as TreeController;
        const currentSelection = treeInstance.getState().selectedItems;
        const expectedSelection = [elementIdToTreeId(selectedElementId)];

        // Only update if selection actually changed
        if (JSON.stringify(currentSelection) !== JSON.stringify(expectedSelection)) {
          treeInstance.setSelectedItems(expectedSelection);
        }
      } catch (error) {
        // Ignore selection sync errors
      }
    }
  }, [selectedElementId, tree]);
};
