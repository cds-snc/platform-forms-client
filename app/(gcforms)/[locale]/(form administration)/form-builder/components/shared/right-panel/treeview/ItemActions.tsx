import { ReactNode } from "react";
import { DragHandle } from "./icons/DragHandle";
import { DeleteIcon, LockIcon } from "@serverComponents/icons";
import { cn } from "@lib/utils";
import { TreeItemRenderContext } from "react-complex-tree";

type ItemActionProps = {
  context: TreeItemRenderContext;
  arrow: ReactNode;
  lockClassName: string;
  handleDelete: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
};

export const ItemActions = ({ context, arrow, lockClassName, handleDelete }: ItemActionProps) => {
  return context.canDrag ? (
    <>
      {context.isExpanded && (
        <button className="cursor-pointer" onClick={handleDelete}>
          <DeleteIcon title="Delete group" className="absolute right-0 top-0 mr-10 scale-50" />
        </button>
      )}
      <DragHandle
        className={cn(
          "absolute right-0 top-[20px] mr-4 hidden cursor-pointer group-hover:block",
          !arrow && "mt-2"
        )}
      />
    </>
  ) : (
    <LockIcon className={cn("inline-block scale-75", lockClassName)} />
  );
};
