/**
 * Utility functions for TreeView integration with external store - Headless Tree version
 */

// Define the tree data options type
type TreeDataOptions = {
  addIntroElement?: boolean;
  addPolicyElement?: boolean;
  addConfirmationElement?: boolean;
  addSectionTitleElements?: boolean;
  reviewGroup?: boolean;
  headless?: boolean;
};

// Define the getTreeData function type that returns react-complex-tree format
type GetTreeDataFunction = (options: TreeDataOptions) => Record<string, unknown>;

/**
 * Converts element IDs to tree item IDs
 */
export const elementIdToTreeId = (elementId: number): string => {
  return String(elementId);
};

/**
 * Converts tree item IDs back to element IDs
 */
export const treeIdToElementId = (treeId: string): number | null => {
  const id = parseInt(String(treeId));
  return isNaN(id) ? null : id;
};

export const treeOptions = {
  addIntroElement: true,
  addPolicyElement: true,
  addConfirmationElement: true,
  addSectionTitleElements: false,
  reviewGroup: false,
  headless: true,
};

/**
 * Helper to prepare initial tree state from store
 */
export const getInitialTreeState = (selectedElementId?: string) => ({
  expandedItems: ["root"] as string[],
  selectedItems: selectedElementId ? [String(selectedElementId)] : ([] as string[]),
});

/**
 * Safely gets tree items from the store with error handling
 */
export const getTreeItems = (
  getTreeDataFn: GetTreeDataFunction
): Record<string, unknown> | null => {
  try {
    return getTreeDataFn(treeOptions);
  } catch (error) {
    return null;
  }
};

const createCachedTreeItemsReader = (getTreeDataFn: GetTreeDataFunction) => {
  let cachedItems: Record<string, unknown> | null | undefined;
  let clearScheduled = false;

  return () => {
    // Headless-tree asks for many items during one expand/render pass. Reuse the
    // same full tree snapshot for that pass instead of rebuilding it per item.
    if (cachedItems !== undefined) {
      return cachedItems;
    }

    cachedItems = getTreeItems(getTreeDataFn);

    if (!clearScheduled) {
      clearScheduled = true;
      // Clear after the current task so later store changes are picked up on the
      // next interaction without carrying a long-lived stale tree snapshot.
      queueMicrotask(() => {
        cachedItems = undefined;
        clearScheduled = false;
      });
    }

    return cachedItems;
  };
};

type TreeItemsReader = ReturnType<typeof createCachedTreeItemsReader>;

/**
 * Safe data loader function for tree items - converts react-complex-tree to headless-tree format
 */
export const createSafeItemLoader = (
  getTreeDataFn: GetTreeDataFunction,
  readTreeItems: TreeItemsReader = createCachedTreeItemsReader(getTreeDataFn)
) => {
  return (itemId: string): Record<string, unknown> => {
    const items = readTreeItems();

    // Always ensure we return something, never undefined
    if (!items) {
      return { name: itemId, type: "unknown" };
    }

    const item = items[itemId];

    // If item doesn't exist, return a placeholder
    if (item === undefined || item === null) {
      return { name: itemId, type: "unknown" };
    }

    // For headless-tree, we just return the data object, not the full TreeItem
    const itemData = (item as Record<string, unknown>).data;
    return (itemData as Record<string, unknown>) || { name: itemId, type: "unknown" };
  };
};

/**
 * Safe children loader function for tree items
 */
export const createSafeChildrenLoader = (
  getTreeDataFn: GetTreeDataFunction,
  readTreeItems: TreeItemsReader = createCachedTreeItemsReader(getTreeDataFn)
) => {
  return (itemId: string): string[] => {
    const items = readTreeItems();

    // If items is null/undefined, return empty array
    if (!items) {
      return [];
    }

    const item = items[itemId];

    // If parent item doesn't exist, return empty array
    if (!item || item === null) {
      return [];
    }

    const children = (item as Record<string, unknown>).children;
    return Array.isArray(children) ? children.map(String) : [];
  };
};

export const createSafeDataLoader = (getTreeDataFn: GetTreeDataFunction) => {
  const readTreeItems = createCachedTreeItemsReader(getTreeDataFn);

  return {
    getItem: createSafeItemLoader(getTreeDataFn, readTreeItems),
    getChildren: createSafeChildrenLoader(getTreeDataFn, readTreeItems),
  };
};
