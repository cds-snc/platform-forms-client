import { TreeItem } from "../types";

export function findParentGroup(groups: TreeItem[], elementId: number): TreeItem | undefined {
  for (const group of groups) {
    const found = findGroup(group, elementId);
    if (found) {
      return found;
    }
  }
}

function findGroup(group: TreeItem, elementId: number): TreeItem | undefined {
  if (group.children) {
    for (const child of group.children) {
      if (child.id === String(elementId)) {
        return group;
      }
      const found = findGroup(child, elementId);
      if (found) {
        return found;
      }
    }
  }
}
