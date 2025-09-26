import { TreeItem } from "react-complex-tree";
import { TreeItems } from "../../../app/(gcforms)/[locale]/(form administration)/form-builder/components/shared/right-panel/headless-treeview/types";
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
