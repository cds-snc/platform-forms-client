import { ReactNode } from "react";
import { DragHandle } from "./icons/DragHandle";
import { DeleteIcon, LockIcon } from "@serverComponents/icons";
import { cn } from "@lib/utils";
import { TreeItemData, TreeItemInstance } from "./types";
import { TreeInstance } from "@headless-tree/core";

type ItemActionProps = {
  item: TreeItemInstance<TreeItemData>;
  tree: TreeInstance<TreeItemData>;
  arrow: ReactNode;
  lockClassName: string;
  handleDelete?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
};

export const ItemActions = ({
  item,
  tree,
  arrow,
  lockClassName,
  handleDelete,
}: ItemActionProps) => {
  const { canDrag } = tree.getConfig();

  const canDragItem = canDrag ? canDrag([item]) : true;

  return canDragItem ? (
    <>
      {item.isExpanded() && handleDelete && (
        <button className="cursor-pointer" onClick={handleDelete}>
          <DeleteIcon title="Delete group" className="absolute right-5 top-0 mr-10 scale-50" />
        </button>
      )}
      <DragHandle
        className={cn(
          "absolute right-0 mr-4 hidden cursor-pointer group-hover:block",
          !arrow && ""
        )}
      />
    </>
  ) : (
    <LockIcon className={cn("inline-block scale-75", lockClassName)} />
  );
};
