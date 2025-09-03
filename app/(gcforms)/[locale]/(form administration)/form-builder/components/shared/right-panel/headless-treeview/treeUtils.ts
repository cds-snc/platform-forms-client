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
export const getInitialTreeState = (selectedElementId?: number) => ({
  expandedItems: [] as string[],
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

/**
 * Safe data loader function for tree items - converts react-complex-tree to headless-tree format
 */
export const createSafeItemLoader = (getTreeDataFn: GetTreeDataFunction) => {
  return (itemId: string): Record<string, unknown> => {
    const items = getTreeItems(getTreeDataFn);

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
export const createSafeChildrenLoader = (getTreeDataFn: GetTreeDataFunction) => {
  return (itemId: string): string[] => {
    const items = getTreeItems(getTreeDataFn);

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
