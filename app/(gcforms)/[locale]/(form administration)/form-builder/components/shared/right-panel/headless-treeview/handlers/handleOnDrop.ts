import {
  DragTarget,
  insertItemsAtTarget,
  isOrderedDragTarget,
  ItemInstance,
  removeItemsFromParents,
} from "@headless-tree/core";
import { TreeItemData } from "../types";
import { FormElement } from "@root/lib/types";

export const handleOnDrop = async (
  items: ItemInstance<TreeItemData>[],
  target: DragTarget<TreeItemData>,
  getSubElements: (parentId: number) => FormElement[] | undefined,
  setGroupsLayout: (layout: string[]) => void,
  updateGroupElements: ({ id, elements }: { id: string; elements: string[] }) => void,
  updateSubElements: (elements: FormElement[], parentId: number) => void,
  autoFlowAll: () => void
) => {
  const droppedLevel = target.item.getItemMeta().level;
  const movedItemIds = items.map((item) => item.getId());
  const originalSubElements = getSubElements(Number(target.item.getId())) || [];
  let updatedSubElements: FormElement[] = [];

  // Block non-ordered drops on root level (prevents "drag above start" issues)
  if (droppedLevel === -1 && !isOrderedDragTarget(target)) {
    return;
  }

  await removeItemsFromParents(items, async (item, newChildren) => {
    // Locked items in Start should be ignored
    newChildren = newChildren.filter((id) => id !== "policy" && id !== "intro");

    if (droppedLevel === -1) {
      setGroupsLayout(newChildren);
    }

    if (droppedLevel === 0) {
      updateGroupElements({ id: item.getId(), elements: newChildren });
    }

    if (droppedLevel === 1) {
      updatedSubElements = originalSubElements.filter(
        (el) => !movedItemIds.includes(String(el.id))
      );

      updateSubElements(updatedSubElements, Number(item.getId()));
    }
  });

  await insertItemsAtTarget(movedItemIds, target, (item, newChildren) => {
    // Locked items in Start should not be included in the new layout
    newChildren = newChildren.filter((id) => id !== "policy" && id !== "intro");

    if (droppedLevel === -1) {
      setGroupsLayout(newChildren);
      autoFlowAll();
      items[items.length - 1].setFocused();
    }

    if (droppedLevel === 0) {
      updateGroupElements({ id: item.getId(), elements: newChildren });
    }

    if (droppedLevel === 1) {
      const movedSubElements = originalSubElements.filter((el) =>
        movedItemIds.includes(String(el.id))
      );

      // Handle ordered drops for sub-elements (insert between items)
      if (isOrderedDragTarget(target)) {
        // Insert movedSubElements into updatedSubElements at target.insertionIndex
        const newSubElements = [
          ...updatedSubElements.slice(0, target.insertionIndex),
          ...movedSubElements,
          ...updatedSubElements.slice(target.insertionIndex),
        ];

        updateSubElements(newSubElements, Number(target.item.getId()));
      } else {
        // For non-ordered drops, just append to the end
        updateSubElements(
          [...updatedSubElements, ...movedSubElements],
          Number(target.item.getId())
        );
      }
    }
  });
};
