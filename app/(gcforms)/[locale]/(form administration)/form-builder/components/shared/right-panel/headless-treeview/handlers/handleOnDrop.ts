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
  rebuildTree: () => void
) => {
  const droppedLevel = target.item.getItemMeta().level;

  // Block non-ordered drops on root level (prevents "drag above start" issues)
  if (droppedLevel === -1 && !isOrderedDragTarget(target)) {
    return;
  }

  // Handle moving subElements

  const movedItemIds = items.map((item) => item.getId());
  const originalSubElements = getSubElements(Number(target.item.getId())) || [];
  let updatedSubElements: FormElement[] = [];

  await removeItemsFromParents(items, (item, newChildren) => {
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
    if (droppedLevel === -1) {
      setGroupsLayout(newChildren);
    }

    if (droppedLevel === 0) {
      updateGroupElements({ id: item.getId(), elements: newChildren });
    }

    if (droppedLevel === 1) {
      const movedSubElements = originalSubElements.filter((el) =>
        movedItemIds.includes(String(el.id))
      );

      // Only handle ordered drops for sub-elements
      if (isOrderedDragTarget(target)) {
        // Insert movedSubElements into updatedSubElements at target.insertionIndex
        const newSubElements = [
          ...updatedSubElements.slice(0, target.insertionIndex),
          ...movedSubElements,
          ...updatedSubElements.slice(target.insertionIndex),
        ];

        updateSubElements(newSubElements, Number(target.item.getId()));
      }
    }
  });

  rebuildTree();
};
