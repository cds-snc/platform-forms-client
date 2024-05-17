import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { ReactNode } from "react";
import { Theme } from "@radix-ui/themes";

export type handleCloseType = (value: boolean) => void;

export const ConfirmDialog = ({
  children,
  handleClose,
}: {
  children: ReactNode;
  handleClose: handleCloseType;
}) => {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <Theme>
          <AlertDialog.Overlay className="AlertDialogOverlay" />
          <AlertDialog.Content className="AlertDialogContent">
            <AlertDialog.Title className="AlertDialogTitle">
              Are you absolutely sure?
            </AlertDialog.Title>
            <AlertDialog.Description className="AlertDialogDescription">
              Do you want to continue? This action cannot be undone.
            </AlertDialog.Description>
            <div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
              <AlertDialog.Cancel asChild>
                <button className="Button mauve" onClick={() => handleClose(false)}>
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button className="Button red" onClick={() => handleClose(true)}>
                  Yes, add to count
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </Theme>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
