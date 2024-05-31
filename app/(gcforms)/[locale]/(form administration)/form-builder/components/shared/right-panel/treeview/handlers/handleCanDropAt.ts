import { GroupsType } from "@lib/formContext";
import { DraggingPosition, DraggingPositionBetweenItems, TreeItem } from "react-complex-tree";

const getReviewIndex = (currentGroups: GroupsType) => {
  const elements = Object.keys(currentGroups);
  return elements.indexOf("review");
};

export const handleCanDropAt = (
  items: TreeItem[],
  target: DraggingPosition,
  getGroups: () => GroupsType | undefined
) => {
  const groupItemsCount = items.filter((item) => item.isFolder).length;
  const nonGroupItemsCount = items.filter((item) => !item.isFolder).length;

  // Can't drag Groups + Items together
  if (groupItemsCount > 0 && nonGroupItemsCount > 0) {
    return false;
  }

  // If any of the selected items is a group
  if (groupItemsCount >= 1) {
    // Groups can't be dropped on another group
    if ((<DraggingPositionBetweenItems>target).parentItem !== "root") {
      return false;
    }

    // Groups can't be dropped after Review
    const currentGroups = getGroups() as GroupsType;
    const reviewIndex = getReviewIndex(currentGroups);

    if ((<DraggingPositionBetweenItems>target).childIndex > reviewIndex) {
      return false;
    }

    // Groups can't be dropped before Start
    if ((<DraggingPositionBetweenItems>target).childIndex === 0) {
      return false;
    }
  }

  // If any of the items is not a group, disallow dropping on root
  if (nonGroupItemsCount >= 1) {
    if (target.targetType === "between-items" && target.parentItem === "root") {
      return false;
    }
  }

  return true;
};
