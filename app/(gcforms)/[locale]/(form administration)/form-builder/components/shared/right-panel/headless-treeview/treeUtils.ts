/**
 * Utility functions for TreeView integration with external store
 */

import { TreeItemIndex, TreeItem } from "react-complex-tree";

// Import types from the main treeview store
type TreeItems = Record<TreeItemIndex, TreeItem>;

// Define the tree data options type
type TreeDataOptions = {
  addIntroElement?: boolean;
  addPolicyElement?: boolean;
  addConfirmationElement?: boolean;
  addSectionTitleElements?: boolean;
  reviewGroup?: boolean;
  headless?: boolean;
};

// Define the getTreeData function type
type GetTreeDataFunction = (options: TreeDataOptions) => TreeItems;

/**
 * Converts element IDs to tree item IDs
 */
export const elementIdToTreeId = (elementId: number): TreeItemIndex => {
  return String(elementId);
};

/**
 * Converts tree item IDs back to element IDs
 */
export const treeIdToElementId = (treeId: TreeItemIndex): number | null => {
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

export const createTreeItem = (itemId: string): TreeItem => {
  return {
    index: itemId,
    canMove: false,
    canRename: false,
    data: { titleEn: "", titleFr: "" },
    children: [],
    isFolder: false,
  };
};

/**
 * Safely gets tree items from the store with error handling
 */
export const getTreeItems = (getTreeDataFn: GetTreeDataFunction): TreeItems | null => {
  try {
    return getTreeDataFn(treeOptions);
  } catch (error) {
    return null;
  }
};

/**
 * Safe data loader function for tree items
 */
export const createSafeItemLoader = (getTreeDataFn: GetTreeDataFunction) => {
  return (itemId: string): TreeItem => {
    const items = getTreeItems(getTreeDataFn);

    // Always ensure we return something, never undefined
    if (!items) {
      return createTreeItem(itemId);
    }

    const item = items[itemId];

    // If item doesn't exist, return a placeholder
    if (item === undefined || item === null) {
      return createTreeItem(itemId);
    }

    return item;
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

    const children = item.children;
    return Array.isArray(children) ? children.map(String) : [];
  };
};
