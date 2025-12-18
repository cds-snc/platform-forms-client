import { DragHandleIcon } from "../icons/DragHandleIcon";
import { LockIcon } from "@serverComponents/icons";
import { cn } from "@lib/utils";

type ItemActionProps = {
  canDragItem: boolean;
};

export const DragHandle = ({ canDragItem }: ItemActionProps) => {
  return canDragItem ? (
    <DragHandleIcon className={cn("hidden cursor-pointer group-hover:block")} />
  ) : (
    <LockIcon className={cn("inline-block scale-75")} />
  );
};
