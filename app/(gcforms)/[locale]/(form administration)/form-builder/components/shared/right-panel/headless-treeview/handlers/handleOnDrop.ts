import {
  DragTarget,
  insertItemsAtTarget,
  isOrderedDragTarget,
  ItemInstance,
  removeItemsFromParents,
} from "@headless-tree/core";
import { TreeItemData } from "../types";
import { FormElement } from "@root/lib/types";
import { Group, GroupsType } from "@root/packages/types/src";
import { autoFlowGroupNextActions } from "@root/lib/groups/utils/setNextAction";

const groupsHaveCustomRules = (items: Group[]) => {
  return items.some((item) => Object.hasOwn(item, "autoFlow") && !item.autoFlow);
};

export const handleOnDrop = async (
  items: ItemInstance<TreeItemData>[],
  target: DragTarget<TreeItemData>,
  getGroups: () => GroupsType | undefined,
  replaceGroups: (groups: GroupsType) => void,
  getSubElements: (parentId: number) => FormElement[] | undefined,
  setGroupsLayout: (layout: string[]) => void,
  updateGroupElements: ({ id, elements }: { id: string; elements: string[] }) => void,
  updateSubElements: (elements: FormElement[], parentId: number) => void,
  getPromise: () => Promise<boolean>,
  setOpenDialog: (value: boolean) => void
) => {
  const droppedLevel = target.item.getItemMeta().level;
  const movedItemIds = items.map((item) => item.getId());
  const originalSubElements = getSubElements(Number(target.item.getId())) || [];
  let currentGroups = getGroups() as GroupsType;
  let updatedSubElements: FormElement[] = [];
  let promptForReflow = false;
  const keysToReflow: string[] = [];

  // Block non-ordered drops on root level (prevents "drag above start" issues)
  if (droppedLevel === -1 && !isOrderedDragTarget(target)) {
    return;
  }

  await removeItemsFromParents(items, async (item, newChildren) => {
    if (droppedLevel === -1) {
      setGroupsLayout(newChildren);
      items.forEach((item) => {
        const movedGroup = currentGroups[item.getId()];
        if (groupsHaveCustomRules([movedGroup])) {
          promptForReflow = true;
        }
        keysToReflow.push(item.getId());
      });

      if (promptForReflow) {
        setOpenDialog(true);
        const confirm = getPromise();

        const confirmed = await confirm;

        if (confirmed) {
          keysToReflow.forEach((key) => {
            currentGroups = autoFlowGroupNextActions(currentGroups, key);
          });
          setOpenDialog(false);
        } else {
          setOpenDialog(false);
        }

        replaceGroups(currentGroups);
      }
    }

    if (droppedLevel === 0) {
      updateGroupElements({ id: item.getId(), elements: newChildren });
    }

    if (droppedLevel === 1) {
      updatedSubElements = originalSubElements.filter(
        (el) => !movedItemIds.includes(String(el.id))
      );
      updateSubElements(updatedSubElements, Number(item.getId()));
    }
  });

  await insertItemsAtTarget(movedItemIds, target, (item, newChildren) => {
    if (droppedLevel === -1) {
      setGroupsLayout(newChildren);
      items[items.length - 1].setFocused();
    }

    if (droppedLevel === 0) {
      updateGroupElements({ id: item.getId(), elements: newChildren });
    }

    if (droppedLevel === 1) {
      const movedSubElements = originalSubElements.filter((el) =>
        movedItemIds.includes(String(el.id))
      );

      // Only handle ordered drops for sub-elements
      if (isOrderedDragTarget(target)) {
        // Insert movedSubElements into updatedSubElements at target.insertionIndex
        const newSubElements = [
          ...updatedSubElements.slice(0, target.insertionIndex),
          ...movedSubElements,
          ...updatedSubElements.slice(target.insertionIndex),
        ];

        updateSubElements(newSubElements, Number(target.item.getId()));
      }
    }
  });
};
