import { TreeItem } from "react-complex-tree";
import { TreeItems } from "../types";
import { getGroupFromId } from "./getGroupFromId";

export function findNextGroup(groups: TreeItems, elementId: string): TreeItem | undefined {
  const currentGroup = getGroupFromId(groups, elementId);

  if (!currentGroup) {
    return undefined;
  }

  const keys = Object.keys(groups);

  const currentIndex = keys.findIndex((group) => group === elementId);
  const nextGroup = keys.at(keys.indexOf(elementId) + 1);

  if (currentIndex === -1 || nextGroup === undefined) {
    return undefined;
  }

  return groups[nextGroup];
}
