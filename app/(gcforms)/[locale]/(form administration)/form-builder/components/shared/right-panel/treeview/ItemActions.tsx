import { ReactNode } from "react";
import { DragHandle } from "./icons/DragHandle";
import { AddIcon, DeleteIcon, LockIcon } from "@serverComponents/icons";
import { cn } from "@lib/utils";
import { TreeItemRenderContext } from "react-complex-tree";

type ItemActionProps = {
  context: TreeItemRenderContext;
  arrow: ReactNode;
  lockClassName: string;
  handleDelete: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
};

const handleAdd = () => {
  alert("Add form element");
};

export const ItemActions = ({ context, arrow, lockClassName, handleDelete }: ItemActionProps) => {
  return context.canDrag ? (
    <>
      {context.isExpanded && (
        <div className="absolute right-5 top-3 mr-10 flex flex-row">
          <button
            className="cursor-pointer rounded-lg border border-transparent p-1 hover:border-blue-focus hover:bg-blue-200"
            onClick={handleAdd}
          >
            <AddIcon
              title="Add form element"
              className="rounded-full border-1 border-black fill-black"
            />
          </button>
          <button
            className=" cursor-pointer rounded-lg border border-transparent p-1 hover:border-blue-focus hover:bg-blue-200"
            onClick={handleDelete}
          >
            <DeleteIcon title="Delete group" className="size-6" />
          </button>
        </div>
      )}
      <DragHandle
        className={cn(
          "absolute right-0 mr-4 hidden cursor-pointer group-hover:block",
          !arrow && "mt-2"
        )}
      />
    </>
  ) : (
    <LockIcon className={cn("inline-block scale-75", lockClassName)} />
  );
};
