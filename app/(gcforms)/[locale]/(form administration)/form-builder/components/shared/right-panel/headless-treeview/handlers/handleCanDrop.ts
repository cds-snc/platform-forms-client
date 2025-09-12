import { DragTarget, ItemInstance } from "@headless-tree/core"
import { TreeItemData } from "../types"

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

  // Root level items can only be dropped on root (-1)
  if (draggedItemLevel === 0) {
    // console.log(target?.getItemMeta()?.level);

    // Can't drop above start
    if (target.insertionIndex === 0) {
      return false;
    }

    const targetChildren = targetItem.getChildren();

    // Can't drop below end
    if (target.insertionIndex === targetChildren.length - 1) {
      return false;
    }


    if (target.item.getId() === "root") {
      return true;
    }
    return false;
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
}