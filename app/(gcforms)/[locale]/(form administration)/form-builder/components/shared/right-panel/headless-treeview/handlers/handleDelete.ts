import { type Group, GroupsType } from "@gcforms/types";
import { ItemInstance } from "@headless-tree/core";
import { TreeItemData } from "../types";

export const handleDelete = async (
  item: ItemInstance<TreeItemData>,
  getGroups: () => GroupsType | undefined,
  groupsHaveCustomRules: (groups: Group[]) => boolean,
  canDeleteGroup: (groups: GroupsType, nextAction: string) => boolean,
  setOpenConfirmDeleteDialog: (value: boolean) => void,
  getConfirmDeletePromise: () => Promise<boolean>,
  removeItem: (id: number) => void,
  deleteGroup: (id: string) => void,
  setId: (id: string) => void,
  updateGroupsLayout: () => Promise<void>,
  autoFlowAll: () => void,
  tree: { rebuildTree: () => void },
  onSuccess?: () => void,
  onError?: () => void
) => {
  const groups = getGroups() || {};

  const hasCustomRules = groupsHaveCustomRules(Object.values(groups));

  if (hasCustomRules && !canDeleteGroup(groups, item.getItemData().nextAction ?? "")) {
    onError && onError();
    return;
  }

  setOpenConfirmDeleteDialog(true);
  const confirm = await getConfirmDeletePromise();

  if (confirm) {
    const children = item.getChildren();
    children.map((child) => {
      removeItem(Number(child));
    });

    deleteGroup(item.getId());

    // When deleting a group, we need to select the previous group
    const previousItem = item.getItemAbove();
    setId(previousItem?.getId() ?? "start");
    previousItem?.setFocused();

    // And update the groups layout
    await updateGroupsLayout();

    autoFlowAll();
    setOpenConfirmDeleteDialog(false);

    tree.rebuildTree();

    onSuccess && onSuccess();

    return;
  }
};
