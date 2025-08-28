import { useEffect, useRef } from "react";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { elementIdToTreeId } from "./treeUtils";

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

  useEffect(() => {
    // Just track that groups changed - syncDataLoaderFeature will handle the rest
    if (groups !== groupsRef.current) {
      groupsRef.current = groups;
    }
  }, [groups]);

  // Sync selection from store to tree
  useEffect(() => {
    if (
      selectedElementId !== undefined &&
      tree &&
      typeof (tree as Record<string, unknown>).setSelectedItems === "function"
    ) {
      try {
        const treeInstance = tree as Record<string, unknown>;
        const currentSelection = (treeInstance.getState as () => { selectedItems: string[] })()
          .selectedItems;
        const expectedSelection = [elementIdToTreeId(selectedElementId)];

        // Only update if selection actually changed
        if (JSON.stringify(currentSelection) !== JSON.stringify(expectedSelection)) {
          (treeInstance.setSelectedItems as (items: (string | number)[]) => void)(
            expectedSelection
          );
        }
      } catch (error) {
        // Ignore selection sync errors
      }
    }
  }, [selectedElementId, tree]);
};
