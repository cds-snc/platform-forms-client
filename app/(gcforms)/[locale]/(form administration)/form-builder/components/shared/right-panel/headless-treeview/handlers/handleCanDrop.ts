import { DragTarget, isOrderedDragTarget, ItemInstance } from "@headless-tree/core";
import { TreeItemData } from "../types";

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
  if (draggedItemLevel === 0) {
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

  // Elements can be dragged into any root level item (0)
  if (draggedItemLevel === 1) {
    if (targetItem?.getItemMeta().level === 0) {
      return true;
    }
    return false;
  }

  // Sub-elements can only be dragged within the same parentID
  if (draggedItemLevel === 2) {
    if (targetItem.getId() === firstDraggedItem.getParent()?.getId()) {
      return true;
    }
    return false;
  }

  return false;
};
