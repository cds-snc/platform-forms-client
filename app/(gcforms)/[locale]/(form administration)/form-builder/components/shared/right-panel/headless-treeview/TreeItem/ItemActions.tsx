import { ReactNode } from "react";
import { DragHandle } from "../icons/DragHandle";
import { LockIcon } from "@serverComponents/icons";
import { cn } from "@lib/utils";
import { TreeItemData, TreeItemInstance } from "../types";
import { TreeInstance } from "@headless-tree/core";

type ItemActionProps = {
  item: TreeItemInstance<TreeItemData>;
  tree: TreeInstance<TreeItemData>;
  arrow: ReactNode;
  handleDelete?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
};

export const ItemActions = ({ item, tree }: ItemActionProps) => {
  const { canDrag } = tree.getConfig();

  const canDragItem = canDrag ? canDrag([item]) : true;

  return canDragItem ? (
    <DragHandle className={cn("hidden cursor-pointer group-hover:block")} />
  ) : (
    <LockIcon className={cn("inline-block scale-75")} />
  );
};
