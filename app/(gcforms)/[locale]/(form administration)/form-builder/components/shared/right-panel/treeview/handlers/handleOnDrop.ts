import { Group, GroupsType } from "@lib/formContext";
import {
  DraggingPosition,
  DraggingPositionBetweenItems,
  DraggingPositionItem,
  TreeItem,
  TreeItemIndex,
} from "react-complex-tree";
import { findParentGroup } from "../util/findParentGroup";
import { TreeItems } from "../types";
import { autoFlowGroupNextActions } from "../util/setNextAction";

const findItemIndex = (items: string[], itemIndex: string | number) =>
  items.indexOf(String(itemIndex));

const isOldItemPriorToNewItem = (
  items: string[],
  itemIndex: string | number,
  targetIndex: number
) => (items.findIndex((child) => child === itemIndex) ?? Infinity) < targetIndex;

const removeItemAtIndex = (items: string[], index: number) => {
  const updatedItems = [...items];
  updatedItems.splice(index, 1);
  return updatedItems;
};

const insertItemAtIndex = (items: string[], item: string, index: number) => {
  const updatedItems = [...items];
  updatedItems.splice(index, 0, item);
  return updatedItems;
};

const groupsHaveCustomRules = (items: Group[]) => {
  return items.some((item) => Object.hasOwn(item, "autoFlow") && !item.autoFlow);
};

/**
 * Autoflow moved items
 * Update the nextAction for the moved items in their new location, and update
 * the nextAction for the item that was before the moved items in their original location.
 */
const updateMovedItemsNextAction = async (
  items: TreeItem[],
  originalGroups: GroupsType,
  newGroups: GroupsType,
  getPromise: () => Promise<boolean>,
  setOpenDialog: (value: boolean) => void
) => {
  const movedItems = items.map((item) => item["index"]);
  // const originalKeys = Object.keys(originalGroups);
  // const newKeys = Object.keys(newGroups);

  const keysToReflow: string[] = [];
  let promptForReflow = false;

  movedItems.forEach((item) => {
    // Check the current item for autoFlow
    const movedGroup = newGroups[item as string] as Group;

    // @TODO: all these commented out blocks are related to autoFlowing sections surrounding
    // the moved item. Not sure this will be required, keeping the code for now.

    // Check the previous item in the new location for autoFlow
    // const oldIndex = originalKeys.indexOf(item as string);
    // const newIndex = newKeys.indexOf(item as string);

    // const prev = newKeys[newIndex - 1];
    // const previousGroup = newGroups[prev] as Group;

    // Check the previous item in the old location for autoFlow
    // const prevOld = originalKeys[oldIndex - 1];
    // const previousGroupOld = originalGroups[prevOld] as Group;

    if (groupsHaveCustomRules([movedGroup])) {
      promptForReflow = true;
    }

    keysToReflow.push(item as string);

    // Set the nextAction for the new location of the current item in its new location
    // newGroups = autoFlowGroupNextActions(newGroups, item as string);

    // Set the nextAction for the item that was before the current item in its original location
    // newGroups = autoFlowGroupNextActions(newGroups, prevOld);
  });

  if (promptForReflow) {
    setOpenDialog(true);
    const confirm = getPromise();

    const confirmed = await confirm;

    if (confirmed) {
      keysToReflow.forEach((key) => {
        newGroups = autoFlowGroupNextActions(newGroups, key);
      });
      setOpenDialog(false);
    } else {
      setOpenDialog(false);
    }
  }

  return newGroups;
};

export const handleOnDrop = async (
  items: TreeItem[],
  target: DraggingPosition,
  getGroups: () => GroupsType | undefined,
  replaceGroups: (groups: GroupsType) => void,
  setSelectedItems: (items: TreeItemIndex[]) => void,
  setExpandedItems: (items: TreeItemIndex[]) => void,
  expandedItems: TreeItemIndex[],
  getTreeData: () => TreeItems,
  getPromise: () => Promise<boolean>,
  setOpenDialog: (value: boolean) => void
) => {
  // Current state of the tree in Groups format
  let currentGroups = getGroups() as GroupsType;

  let targetParent: TreeItemIndex;
  let targetIndex: number;

  if ((<DraggingPositionItem>target).targetType === "item") {
    targetParent = (<DraggingPositionItem>target).targetItem;
    targetIndex = 0;
  } else {
    // Target parent and index
    targetParent = (<DraggingPositionBetweenItems>target).parentItem;
    targetIndex = (<DraggingPositionBetweenItems>target).childIndex;
  }

  let newGroups: GroupsType;
  const selectedItems: string[] = [];

  // Dragging/dropping root-level items
  if (targetParent === "root") {
    let elements = Object.keys(currentGroups);

    let itemsPriorToInsertion = 0;

    items.forEach((item, index) => {
      // Original location
      const originIndex = findItemIndex(elements, item.index);

      // Adjust index if dragging down
      itemsPriorToInsertion += isOldItemPriorToNewItem(elements, item.index, targetIndex) ? 1 : 0;

      // Remove from old position
      elements = removeItemAtIndex(elements, originIndex);

      // Insert at new position
      elements = insertItemAtIndex(
        elements,
        String(item.index),
        targetIndex - itemsPriorToInsertion + index
      );

      selectedItems.push(String(item.index));
    });

    // Create a new Groups object
    newGroups = elements.reduce((acc: GroupsType, key) => {
      const data = currentGroups[key] as Group;
      acc[key] = data;
      return acc;
    }, {});

    newGroups = await updateMovedItemsNextAction(
      items,
      currentGroups,
      newGroups,
      getPromise,
      setOpenDialog
    );

    replaceGroups(newGroups);
    setSelectedItems(selectedItems);

    return;
  }

  // Dragging/dropping other non-root level items
  const targetParentGroup = currentGroups[targetParent];
  let targetGroupElements = [...targetParentGroup.elements];

  let itemsPriorToInsertion = 0;

  let originParentGroup;
  let originGroupElements: string[] = [];

  items.forEach((item, index) => {
    // Remove item from original location
    const originParent = findParentGroup(getTreeData(), String(item.index));
    originParentGroup = currentGroups[originParent?.index as string];

    // Dragging/dropping item within same group
    if (originParentGroup == targetParentGroup) {
      originGroupElements = (originParent?.children || []) as string[];
      const originIndex = originGroupElements.indexOf(String(item.index));

      // Adjust index if dragging down
      itemsPriorToInsertion += isOldItemPriorToNewItem(targetGroupElements, item.index, targetIndex)
        ? 1
        : 0;

      // Remove item from previous location
      originGroupElements = removeItemAtIndex(originGroupElements, originIndex);

      // Insert item at new location
      originGroupElements = insertItemAtIndex(
        originGroupElements,
        String(item.index),
        targetIndex - itemsPriorToInsertion + index
      );

      // Create a new Groups object
      const newGroups = { ...currentGroups };
      newGroups[String(originParent?.index)] = {
        name: String(originParent?.data.name),
        elements: originGroupElements,
        titleEn: originParent?.data.titleEn,
        titleFr: originParent?.data.titleFr,
      };

      // Replace the original groups object
      currentGroups = newGroups;

      // Target/Origin groups are the same
      targetGroupElements = originGroupElements;

      selectedItems.push(String(item.index));

      // Replace the groups object and set selected items.
      replaceGroups(newGroups);

      return;
    }

    // Dragging/dropping item between groups
    originGroupElements = (originParent?.children || []) as string[];
    const originIndex = originGroupElements.indexOf(String(item.index));

    // Adjust index if dragging down
    itemsPriorToInsertion += isOldItemPriorToNewItem(targetGroupElements, item.index, targetIndex)
      ? 1
      : 0;

    // Remove item from previous location
    originGroupElements = removeItemAtIndex(originGroupElements, originIndex);

    // Create a new Groups object
    let newGroups = { ...currentGroups };
    newGroups[String(originParent?.index)] = {
      name: String(originParent?.data.name),
      elements: originGroupElements,
      titleEn: originParent?.data.titleEn,
      titleFr: originParent?.data.titleFr,
    };

    // Replace the original groups object
    currentGroups = newGroups;

    // Insert at new position
    targetGroupElements = insertItemAtIndex(
      targetGroupElements,
      String(item.index),
      targetIndex + index
    );

    newGroups = { ...currentGroups };
    newGroups[targetParent] = {
      name: targetParentGroup.name,
      elements: targetGroupElements,
      titleEn: targetParentGroup.titleEn,
      titleFr: targetParentGroup.titleFr,
    };

    selectedItems.push(String(item.index));

    replaceGroups(newGroups);

    // Expand the group that the item was dropped into
    setExpandedItems([targetParent, ...expandedItems]);
  });

  setSelectedItems(selectedItems);
};
