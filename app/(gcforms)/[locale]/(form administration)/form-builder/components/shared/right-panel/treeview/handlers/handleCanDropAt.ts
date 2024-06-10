import { GroupsType } from "@lib/formContext";
import {
  DraggingPosition,
  DraggingPositionBetweenItems,
  DraggingPositionItem,
  TreeItem,
} from "react-complex-tree";

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
  getGroups: () => GroupsType | undefined
) => {
  const groupItemsCount = items.filter((item) => item.isFolder).length;
  const nonGroupItemsCount = items.filter((item) => !item.isFolder).length;
  const targetDraggingPositionType = getTargetDraggingPositionType(target);

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
