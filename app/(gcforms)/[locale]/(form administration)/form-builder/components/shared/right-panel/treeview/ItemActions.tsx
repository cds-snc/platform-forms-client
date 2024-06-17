import { ReactNode, useCallback, useState } from "react";
import { DragHandle } from "./icons/DragHandle";
import { AddIcon, DeleteIcon, LockIcon } from "@serverComponents/icons";
import { cn } from "@lib/utils";
import { TreeItemRenderContext } from "react-complex-tree";
import { ElementDialog } from "@formBuilder/[id]/edit/components/elements/element-dialog/ElementDialog";
import { useHandleAdd } from "@lib/hooks/form-builder/useHandleAdd";
import { FormElementTypes } from "@lib/types";

type ItemActionProps = {
  context: TreeItemRenderContext;
  arrow: ReactNode;
  lockClassName: string;
  handleDelete: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
};

export const ItemActions = ({ context, arrow, lockClassName, handleDelete }: ItemActionProps) => {
  const [elementDialog, showElementDialog] = useState(false);

  const { handleAddElement } = useHandleAdd();

  const handleAdd = (type?: FormElementTypes) => {
    // console.log(item);
    // need length of children to add element to end of group
    handleAddElement(0, type);
  };

  const handleOpenDialog = useCallback(() => {
    showElementDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    showElementDialog(false);
  }, []);

  return context.canDrag ? (
    <>
      {context.isExpanded && (
        <div className="absolute right-5 top-3 mr-10 flex flex-row">
          <button
            className="cursor-pointer rounded-lg border border-transparent p-1 hover:border-black hover:bg-violet-50 focus:border-blue-focus"
            onClick={handleOpenDialog}
          >
            <AddIcon
              title="Add form element"
              className="rounded-full border-1 border-black fill-black"
            />
          </button>
          <button
            className=" cursor-pointer rounded-lg border border-transparent p-1 hover:border-black hover:bg-violet-50 focus:border-blue-focus"
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
      {elementDialog && (
        <ElementDialog
          handleAddType={(type: FormElementTypes | undefined) => {
            handleAdd && handleAdd(type);
          }}
          handleClose={handleCloseDialog}
        />
      )}
    </>
  ) : (
    <LockIcon className={cn("inline-block scale-75", lockClassName)} />
  );
};
