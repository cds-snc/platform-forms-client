import { TreeItem } from "../types";

export function getGroupFromId(groups: TreeItem[], elementId: string): TreeItem | undefined {
  if (!Array.isArray(groups)) {
    return undefined;
  }

  for (const group of groups) {
    if (group.id === elementId) {
      return group;
    }
    if (group.children) {
      for (const child of group.children) {
        if (child.id === elementId) {
          return group;
        }
      }
    }
  }
}
