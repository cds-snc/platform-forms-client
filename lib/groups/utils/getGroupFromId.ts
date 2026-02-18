import {
  TreeItem,
  TreeItems,
} from "@formBuilder/components/shared/right-panel/headless-treeview/types";

export function getGroupFromId(groups: TreeItems, elementId: string): TreeItem | undefined {
  if (groups[elementId]) {
    return groups[elementId];
  }

  return undefined;
}
