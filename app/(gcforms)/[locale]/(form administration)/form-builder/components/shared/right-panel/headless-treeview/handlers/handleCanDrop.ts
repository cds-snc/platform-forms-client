import { DragTarget, isOrderedDragTarget, ItemInstance } from "@headless-tree/core";
import { TreeItemData } from "../types";

// Tree level constants for better readability
const TREE_LEVELS = {
  ROOT: -1,
  GROUP: 0,
  ELEMENT: 1,
  SUB_ELEMENT: 2,
} as const;

const isDynamicRow = (item: ItemInstance<TreeItemData>): boolean => {
  return item.getItemData().type === "dynamicRow";
};

const isGroup = (item: ItemInstance<TreeItemData>): boolean => {
  return item.isFolder() && !isDynamicRow(item);
};

const isNonGroupItem = (item: ItemInstance<TreeItemData>): boolean => {
  return !item.isFolder() || isDynamicRow(item);
};

const validateItemTypesCompatible = (items: ItemInstance<TreeItemData>[]): boolean => {
  const draggedGroupItemsCount = items.filter(isGroup).length;
  const draggedNonGroupItemsCount = items.filter(isNonGroupItem).length;

  // Can't drag Groups + Items together
  return !(draggedGroupItemsCount > 0 && draggedNonGroupItemsCount > 0);
};

const validateRootOrderedDrop = (
  target: DragTarget<TreeItemData>,
  targetItem: ItemInstance<TreeItemData>
): boolean => {
  if (!isOrderedDragTarget(target)) {
    return true; // Allow non-ordered drops
  }

  const targetChildren = targetItem.getChildren();
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
};

const validateGroupLevelDrop = (
  target: DragTarget<TreeItemData>,
  targetItem: ItemInstance<TreeItemData>
): boolean => {
  // Must be dropping on the root item
  if (target.item.getId() !== "root") {
    return false;
  }

  return validateRootOrderedDrop(target, targetItem);
};

const validateElementLevelDrop = (
  target: DragTarget<TreeItemData>,
  targetItem: ItemInstance<TreeItemData>
): boolean => {
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
};

const validateSubElementLevelDrop = (
  targetItem: ItemInstance<TreeItemData>,
  firstDraggedItem: ItemInstance<TreeItemData>
): boolean => {
  // Sub-elements can only be dragged within the same parentID
  return targetItem.getId() === firstDraggedItem.getParent()?.getId();
};

export const handleCanDrop = (
  items: ItemInstance<TreeItemData>[],
  target: DragTarget<TreeItemData>
) => {
  // Guard clause: Handle empty items array
  if (items.length === 0) {
    return false;
  }

  const targetItem = target.item;
  const firstDraggedItem = items[0];
  const draggedItemLevel = firstDraggedItem.getItemMeta().level;

  // Validate that we don't mix groups and non-groups
  if (!validateItemTypesCompatible(items)) {
    return false;
  }

  // All dragged items must be of the same level
  if (!items.every((item) => item.getItemMeta().level === draggedItemLevel)) {
    return false;
  }

  // Validate based on the level of the dragged items
  switch (draggedItemLevel) {
    case TREE_LEVELS.GROUP:
      return validateGroupLevelDrop(target, targetItem);

    case TREE_LEVELS.ELEMENT:
      return validateElementLevelDrop(target, targetItem);

    case TREE_LEVELS.SUB_ELEMENT:
      return validateSubElementLevelDrop(targetItem, firstDraggedItem);

    default:
      return false; // Invalid level
  }
};
