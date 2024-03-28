import { TreeItem } from "../types";
import { getGroupFromId } from "./getGroupFromId";

export function findPreviousGroup(groups: TreeItem[], elementId: string): TreeItem | undefined {
  if (!Array.isArray(groups)) {
    return undefined;
  }

  const currentGroup = getGroupFromId(groups, elementId);

  if (!currentGroup) {
    return undefined;
  }

  const currentIndex = groups.findIndex((group) => group.id === currentGroup.id);

  if (currentIndex === -1) {
    return undefined;
  }

  return groups[currentIndex - 1];
}
