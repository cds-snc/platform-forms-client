import {
  DragTarget,
  insertItemsAtTarget,
  isOrderedDragTarget,
  ItemInstance,
  removeItemsFromParents,
} from "@headless-tree/core";
import { TreeItemData } from "../types";
import { FormElement } from "@root/lib/types";
import { TREE_LEVELS } from "../constants";

// Filter out locked items that should not be included in layouts
const filterLockedItems = (items: string[]): string[] => {
  return items.filter((id) => id !== "policy" && id !== "intro");
};

// Convert item ID to number
const getItemIdAsNumber = (item: ItemInstance<TreeItemData>): number => {
  return Number(item.getId());
};

// Convert element ID to string
const getElementIdAsString = (element: FormElement): string => {
  return String(element.id);
};

// Handle sub-element reordering for element-level drops
const handleSubElementReordering = (
  originalSubElements: FormElement[],
  movedItemIds: string[],
  updatedSubElementsRef: { current: FormElement[] },
  target: DragTarget<TreeItemData>,
  updateSubElements: (elements: FormElement[], parentId: number) => void
): void => {
  const movedSubElements = originalSubElements.filter((el: FormElement) =>
    movedItemIds.includes(getElementIdAsString(el))
  );

  // Handle ordered drops for sub-elements (insert between items)
  if (isOrderedDragTarget(target)) {
    // Insert movedSubElements into updatedSubElements at target.insertionIndex
    const newSubElements = [
      ...updatedSubElementsRef.current.slice(0, target.insertionIndex),
      ...movedSubElements,
      ...updatedSubElementsRef.current.slice(target.insertionIndex),
    ];

    updateSubElements(newSubElements, getItemIdAsNumber(target.item));
  } else {
    // For non-ordered drops, just append to the end
    updateSubElements(
      [...updatedSubElementsRef.current, ...movedSubElements],
      getItemIdAsNumber(target.item)
    );
  }
};

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
  const originalSubElements = getSubElements(getItemIdAsNumber(target.item)) || [];
  let updatedSubElements: FormElement[] = [];

  // Block non-ordered drops on root level (prevents "drag above start" issues)
  if (droppedLevel === TREE_LEVELS.ROOT && !isOrderedDragTarget(target)) {
    return;
  }

  /**
   * First, remove items from their original location
   */
  await removeItemsFromParents(items, async (item, newChildren) => {
    // Locked items in Start should be ignored
    newChildren = filterLockedItems(newChildren);

    if (droppedLevel === TREE_LEVELS.ROOT) {
      setGroupsLayout(newChildren);
    }

    if (droppedLevel === TREE_LEVELS.GROUP) {
      updateGroupElements({ id: item.getId(), elements: newChildren });
    }

    if (droppedLevel === TREE_LEVELS.ELEMENT) {
      updatedSubElements = originalSubElements.filter(
        (el) => !movedItemIds.includes(getElementIdAsString(el))
      );

      updateSubElements(updatedSubElements, getItemIdAsNumber(item));
    }
  });

  /**
   * Insert items in their new location
   */
  await insertItemsAtTarget(movedItemIds, target, (item, newChildren) => {
    // Locked items in Start should not be included in the new layout
    newChildren = filterLockedItems(newChildren);

    if (droppedLevel === TREE_LEVELS.ROOT) {
      setGroupsLayout(newChildren);
      autoFlowAll();
      items[items.length - 1].setFocused();
    }

    if (droppedLevel === TREE_LEVELS.GROUP) {
      updateGroupElements({ id: item.getId(), elements: newChildren });
    }

    if (droppedLevel === TREE_LEVELS.ELEMENT) {
      handleSubElementReordering(
        originalSubElements,
        movedItemIds,
        { current: updatedSubElements },
        target,
        updateSubElements
      );
    }
  });
};
