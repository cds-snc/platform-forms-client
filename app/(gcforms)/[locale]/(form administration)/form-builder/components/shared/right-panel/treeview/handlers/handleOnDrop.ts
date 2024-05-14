import { Group, GroupsType } from "@lib/formContext";
import { DraggingPosition, DraggingPositionBetweenItems, TreeItem } from "react-complex-tree";
import { findParentGroup } from "../util/findParentGroup";
import { TreeItems } from "../types";

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

export const handleOnDrop = (
  items: TreeItem[],
  target: DraggingPosition,
  getGroups: () => GroupsType | undefined,
  replaceGroups: (groups: GroupsType) => void,
  setSelectedItems: (items: string[]) => void,
  getTreeData: () => TreeItems
) => {
  // Current state of the tree in Groups format
  let currentGroups = getGroups() as GroupsType;

  // Target parent and index
  const { parentItem: targetParent, childIndex: targetIndex } =
    target as DraggingPositionBetweenItems;

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

    // newGroups = autoTreeViewFlow(newGroups);

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
        name: String(originParent?.data.titleEn),
        elements: originGroupElements,
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
      name: String(originParent?.data.titleEn),
      elements: originGroupElements,
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
    };

    selectedItems.push(String(item.index));

    replaceGroups(newGroups);
  });

  setSelectedItems(selectedItems);
};
