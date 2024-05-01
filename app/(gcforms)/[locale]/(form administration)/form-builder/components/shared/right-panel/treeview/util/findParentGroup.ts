import { TreeItem } from "react-complex-tree";
import { TreeItems } from "../types";

export function findParentGroup(groups: TreeItems, elementId: string): TreeItem | undefined {
  for (const [, group] of Object.entries(groups)) {
    if (group.children) {
      for (const child of group.children) {
        if (child === elementId) {
          return group;
        }
      }
    }
  }
}
