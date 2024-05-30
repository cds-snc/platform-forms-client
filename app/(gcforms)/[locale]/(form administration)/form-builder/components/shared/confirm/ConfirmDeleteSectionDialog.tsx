import { Button } from "@clientComponents/globals";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

export type handleCloseType = (value: boolean) => void;

export const ConfirmDeleteSectionDialog = ({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: handleCloseType;
}) => {
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[200] h-screen w-screen bg-gray-500/70" />
        <AlertDialog.Content className="absolute left-1/2 top-1/2 z-[201] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-2xl">
          <AlertDialog.Title className="text-2xl font-extrabold leading-tight">
            Delete this group?
          </AlertDialog.Title>
          <AlertDialog.Description className="pb-6">
            <p>
              <strong>Questions will also be deleted</strong>
              <br />
              Elements within the group will also be deleted.
            </p>
            <p>
              <strong>Move questions </strong>
              <br />
              Move all elements that you would like to keep to another group.
            </p>
          </AlertDialog.Description>
          <div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
            <AlertDialog.Cancel asChild>
              <Button onClick={() => handleClose(false)} theme="secondary">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button onClick={() => handleClose(true)} theme="destructive">
                Delete group and elements
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
