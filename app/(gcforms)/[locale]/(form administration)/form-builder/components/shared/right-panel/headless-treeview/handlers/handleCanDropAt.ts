import { type GroupsType } from "@gcforms/types";
import { FormElement } from "@lib/types";

export const createHeadlessCanDropHandler = (
  getGroups: () => GroupsType | undefined,
  getElement: (id: number) => FormElement | undefined
) => {
  return (itemIds: string[], targetParentId: string, targetIndex: number): boolean => {
    try {
      const currentGroups = getGroups();
      if (!currentGroups) return false;

      // Check if any of the dragged items are root-level groups/sections
      const draggedItemsAreGroups = itemIds.some((id) => currentGroups[id] !== undefined);

      // If dragging root-level groups/sections
      if (draggedItemsAreGroups) {
        // Root-level items can ONLY be dropped at root level
        if (targetParentId !== "root") {
          return false;
        }

        // Check if ALL dragged items are groups (prevent mixing)
        const allDraggedAreGroups = itemIds.every((id) => currentGroups[id] !== undefined);
        if (!allDraggedAreGroups) {
          return false; // Can't mix groups and non-groups
        }

        // For now, allow all root-level reordering to test
        return true;
      }

      // For non-root items (form elements), different rules apply

      // Can't drop on special locked sections
      if (["intro", "policy", "confirmation"].includes(targetParentId)) {
        return false;
      }

      // Can't drop before certain items in start section
      if (targetParentId === "start" && targetIndex < 2) {
        return false;
      }

      // Can't drop elements inside a dynamicRow
      const targetElement = getElement(Number(targetParentId));
      if (targetElement && targetElement.type === "dynamicRow") {
        return false;
      }

      // Can't drop on End section
      if (targetParentId === "end") {
        return false;
      }

      // Can't drop form elements at root level
      if (targetParentId === "root") {
        return false;
      }

      // Can't drop form elements into other form elements (only into groups)
      const targetIsGroup = currentGroups[targetParentId] !== undefined;
      if (!targetIsGroup && !["start", "end"].includes(targetParentId)) {
        return false;
      }

      return true;
    } catch (error) {
      // If there's any error in validation, be conservative and disallow
      return false;
    }
  };
};
