import { DragTarget, isOrderedDragTarget, ItemInstance } from "@headless-tree/core";
import { TreeItemData } from "../types";

// Tree level constants for better readability
const TREE_LEVELS = {
  ROOT: -1,
  GROUP: 0,
  ELEMENT: 1,
  SUB_ELEMENT: 2,
} as const;

export const handleCanDrop = (
  items: ItemInstance<TreeItemData>[],
  target: DragTarget<TreeItemData>
) => {
  const targetItem = target.item;

  const groupItemsCount = items.filter(
    (item) => item.isFolder() && item.getItemData().type !== "dynamicRow"
  ).length;

  const nonGroupItemsCount = items.filter(
    (item) => !item.isFolder() || item.getItemData().type === "dynamicRow"
  ).length;

  // Can't drag Groups + Items together
  if (groupItemsCount > 0 && nonGroupItemsCount > 0) {
    return false;
  }

  const firstDraggedItem = items[0];
  const draggedItemLevel = firstDraggedItem.getItemMeta().level;

  // All dragged items must be of the same level
  if (!items.every((item) => item.getItemMeta().level === draggedItemLevel)) {
    return false;
  }

  // Root level items can only be dropped between Start and End
  if (draggedItemLevel === TREE_LEVELS.GROUP) {
    // Must be dropping on the root item
    if (target.item.getId() !== "root") {
      return false;
    }

    const targetChildren = targetItem.getChildren();

    // For ordered drops (between items), validate insertion position
    if (isOrderedDragTarget(target)) {
      const endIndex = targetChildren.findIndex((child) => child.getId() === "end");

      // Can't drop before Start (position 0)
      if (target.insertionIndex === 0) {
        return false;
      }

      // Can't drop at the very end (position equals length)
      if (target.insertionIndex === targetChildren.length) {
        return false;
      }

      // Can't drop at or after End position
      if (endIndex !== -1 && target.insertionIndex >= endIndex) {
        return false;
      }

      return true;
    }

    // Allow non-ordered drops for now - they'll be handled in onDrop
    // This prevents interference with the library's drag target creation
    return true;
  }

  if (draggedItemLevel === TREE_LEVELS.ELEMENT) {
    // Can't drop on End
    if (targetItem.getId() === "end") {
      return false;
    }

    // Can drop on start but only below privacy policy (must be after intro=0 and policy=1)
    if (targetItem.getId() === "start") {
      if (isOrderedDragTarget(target)) {
        const PRIVACY_POLICY_INDEX = 2; // Elements must come after intro and policy
        if (target.insertionIndex < PRIVACY_POLICY_INDEX) {
          return false;
        }
      }
    }

    // Otherwise ok to drop Elements into any root level item (GROUP level)
    if (targetItem?.getItemMeta().level === TREE_LEVELS.GROUP) {
      return true;
    }

    return false;
  }

  // Sub-elements can only be dragged within the same parentID
  if (draggedItemLevel === TREE_LEVELS.SUB_ELEMENT) {
    if (targetItem.getId() === firstDraggedItem.getParent()?.getId()) {
      return true;
    }
    return false;
  }

  return false;
};
