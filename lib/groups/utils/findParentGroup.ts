import {
  TreeItem,
  TreeItems,
} from "@formBuilder/components/shared/right-panel/headless-treeview/types";

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
