import { TreeItem } from "react-complex-tree";
import { TreeItems } from "../../../app/(gcforms)/[locale]/(form administration)/form-builder/components/shared/right-panel/headless-treeview/types";

export function getGroupFromId(groups: TreeItems, elementId: string): TreeItem | undefined {
  if (groups[elementId]) {
    return groups[elementId];
  }

  return undefined;
}
