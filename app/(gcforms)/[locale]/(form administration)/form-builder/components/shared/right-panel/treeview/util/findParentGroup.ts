import { TreeItem } from "../types";

export function findParentGroup(groups: TreeItem[], elementId: string): TreeItem | undefined {
  if (!Array.isArray(groups)) {
    return undefined;
  }

  for (const group of groups) {
    if (group.children) {
      for (const child of group.children) {
        if (child.id === elementId) {
          return group;
        }
      }
    }
  }
}
