import { type GroupsType } from "@gcforms/types";
import { FormElement } from "@lib/types";

// Type definitions for headless-tree drag target
export type HeadlessDragTarget = {
  parentId: string;
  index: number;
  targetType: "parent" | "between-items";
};

export const createHeadlessDropHandler = (
  getGroups: () => GroupsType | undefined,
  replaceGroups: (groups: GroupsType) => void,
  getSubElements: (parentId: number) => FormElement[] | undefined,
  updateSubElements: (elements: FormElement[], parentId: number) => void,
  rebuildTree: () => void
) => {
  return (parent: { getId: () => string }, newChildren: string[]) => {
    const parentId = parent.getId();

    try {
      const currentGroups = getGroups();
      if (!currentGroups) return;

      // Handle root-level group reordering
      if (parentId === "root") {
        // Get all current group keys
        const allGroupKeys = Object.keys(currentGroups);

        // Find which groups are being reordered vs which should be preserved
        const reorderedGroups = new Set(newChildren);
        const preservedGroups: Record<string, GroupsType[string]> = {};

        // First, preserve any groups that aren't being reordered
        allGroupKeys.forEach((key) => {
          if (!reorderedGroups.has(key)) {
            preservedGroups[key] = currentGroups[key];
          }
        });

        // Create new groups object with reordered keys
        const newGroups: GroupsType = {};

        // Add groups in the new order
        newChildren.forEach((childId: string) => {
          if (currentGroups[childId]) {
            newGroups[childId] = currentGroups[childId];
          }
        });

        // Add back any preserved groups that weren't part of the reordering
        Object.keys(preservedGroups).forEach((key) => {
          newGroups[key] = preservedGroups[key];
        });

        replaceGroups(newGroups);
        rebuildTree();
        return;
      }

      // Handle sub-element reordering within a group
      const parentIdNum = Number(parentId);
      if (!isNaN(parentIdNum)) {
        const subElements = getSubElements(parentIdNum);
        if (!subElements) return;

        // Reorder sub-elements based on newChildren order
        const reorderedElements = newChildren
          .map((childId) => subElements.find((el) => String(el.id) === childId))
          .filter((el): el is FormElement => el !== undefined);

        updateSubElements(reorderedElements, parentIdNum);
        rebuildTree();
        return;
      }

      // Handle group-level element reordering
      if (!currentGroups[parentId]) return;

      const updatedGroups = {
        ...currentGroups,
        [parentId]: {
          ...currentGroups[parentId],
          elements: newChildren,
        },
      };

      replaceGroups(updatedGroups);
      rebuildTree();
    } catch (error) {
      // Silent error handling - just rebuild tree to maintain consistency
      rebuildTree();
    }
  };
};
