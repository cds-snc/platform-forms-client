import { Button } from "@clientComponents/globals";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

export type handleCloseType = (value: boolean) => void;

export const ConfirmDialog = ({
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
            Rewrite rules?
          </AlertDialog.Title>
          <AlertDialog.Description className="pb-6">
            It seems the item(s) you are moving have one or more custom rules. Would you like to
            overwrite those rules with autoflow?
          </AlertDialog.Description>
          <div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
            <AlertDialog.Cancel asChild>
              <Button onClick={() => handleClose(false)} theme="secondary">
                No, move without changing rules
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button onClick={() => handleClose(true)} theme="primary">
                Yes, autoflow
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
