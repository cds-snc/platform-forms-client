import { Button } from "@clientComponents/globals";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

import { useTranslation } from "@i18n/client";

export type handleCloseType = (value: boolean) => void;

export const ConfirmMoveSectionDialog = ({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: handleCloseType;
}) => {
  const { t } = useTranslation("form-builder");
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[200] h-screen w-screen bg-gray-500/70" />
        <AlertDialog.Content className="absolute left-1/2 top-1/2 z-[201] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-2xl">
          <AlertDialog.Title className="text-2xl font-extrabold leading-tight">
            {t("groups.confirmDeleteGroup.title")}
          </AlertDialog.Title>
          <AlertDialog.Description className="pb-6">
            {t("groups.confirmDeleteGroup.description")}
          </AlertDialog.Description>
          <div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
            <AlertDialog.Cancel asChild>
              <Button onClick={() => handleClose(false)} theme="secondary">
                {t("groups.confirmDeleteGroup.cancel")}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button onClick={() => handleClose(true)} theme="primary">
                {t("groups.confirmDeleteGroup.confirm")}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
