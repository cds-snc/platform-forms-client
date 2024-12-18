import { GroupsType } from "@lib/formContext";
import {
  DraggingPosition,
  DraggingPositionBetweenItems,
  DraggingPositionItem,
  TreeItem,
} from "react-complex-tree";

import { FormElement } from "@lib/types";

const getReviewIndex = (currentGroups: GroupsType) => {
  const elements = Object.keys(currentGroups);
  return elements.indexOf("review");
};

const getTargetDraggingPositionType = (target: DraggingPosition) => {
  if (Object.prototype.hasOwnProperty.call(target, "targetItem")) {
    return "item";
  }

  return "between-items";
};

export const handleCanDropAt = (
  items: TreeItem[],
  target: DraggingPosition,
  getGroups: () => GroupsType | undefined,
  getElement: (id: number) => FormElement | undefined
) => {
  const groupItemsCount = items.filter(
    (item) => item.isFolder && item.data.type !== "dynamicRow"
  ).length;
  const nonGroupItemsCount = items.filter(
    (item) => !item.isFolder || item.data.type === "dynamicRow"
  ).length;

  const targetDraggingPositionType = getTargetDraggingPositionType(target);

  if ((<DraggingPositionBetweenItems>target).parentItem === "start") {
    if ((<DraggingPositionBetweenItems>target).childIndex < 2) {
      return false;
    }
  }

  // Can't drop elements inside a dynamicRow
  if (Object.prototype.hasOwnProperty.call(target, "targetItem")) {
    const targetElement = getElement(Number((<DraggingPositionItem>target).targetItem));

    if (targetElement && targetElement.type === "dynamicRow") {
      return false;
    }
  }

  // All dragged items must be of the same parent, and target the same parent
  let targetParentItem = undefined;
  if (Object.prototype.hasOwnProperty.call(target, "parentItem")) {
    const t = target as DraggingPositionItem | DraggingPositionBetweenItems;
    targetParentItem = t.parentItem;
  }

  const hasSubElements = items.some((item) => {
    return item.data.isSubElement;
  });

  if (
    hasSubElements &&
    items.some((item) => {
      return Number(item.data.parentId) !== Number(targetParentItem);
    })
  ) {
    return false;
  }

  // Can't drop elements on a subElement of a dynamicRow
  // but ... allow dragging between subElements
  const targetParentItemElement = getElement(Number(targetParentItem));
  if (targetParentItemElement && targetParentItemElement.type === "dynamicRow") {
    const hasDifferentParent = items.some((item) => {
      return Number(item.data.parentId) !== Number(targetParentItem);
    });

    if (hasDifferentParent) {
      return false;
    }
  }

  // Can't drag Groups + Items together
  if (groupItemsCount > 0 && nonGroupItemsCount > 0) {
    return false;
  }

  // If any of the selected items is a group
  if (groupItemsCount >= 1) {
    // Groups can't be dropped on another group or item
    if (targetDraggingPositionType === "item") {
      return false;
    }

    if (targetDraggingPositionType === "between-items") {
      const currentGroups = getGroups() as GroupsType;
      const reviewIndex = getReviewIndex(currentGroups);

      // Can't drop after Review
      if ((<DraggingPositionBetweenItems>target).childIndex > reviewIndex) {
        return false;
      }

      // Can't drop before Start
      if ((<DraggingPositionBetweenItems>target).childIndex === 0) {
        return false;
      }

      // Can't drop between items inside a folder
      if ((<DraggingPositionBetweenItems>target).parentItem !== "root") {
        return false;
      }
    }

    return true;
  }

  // If any of the items is not a group
  if (nonGroupItemsCount >= 1) {
    // Can't drop on End
    if (
      targetDraggingPositionType === "item" &&
      (<DraggingPositionItem>target).targetItem === "end"
    ) {
      return false;
    }

    // Can't drop between items on root
    if (
      targetDraggingPositionType === "between-items" &&
      (<DraggingPositionBetweenItems>target).parentItem === "root"
    ) {
      return false;
    }

    return true;
  }

  // default false
  return false;
};
