import { TreeItem } from "react-complex-tree";
import { TreeItems } from "../types";

export function getGroupFromId(groups: TreeItems, elementId: string): TreeItem | undefined {
  if (groups[elementId]) {
    return groups[elementId];
  }

  return undefined;
}
