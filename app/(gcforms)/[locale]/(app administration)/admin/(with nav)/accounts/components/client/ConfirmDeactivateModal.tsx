import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";

import { AppUser } from "@lib/types/user-types";
import { updateActive } from "../../actions";

export const ConfirmDeactivateModal = ({
  user,
  handleClose,
}: {
  handleClose: () => void;
  user: AppUser;
}) => {
  const { t } = useTranslation("admin-users");
  const dialog = useDialogRef();

  const actions = (
    <div className="flex gap-4">
      <Button
        theme="primary"
        onClick={async () => {
          await updateActive(user.id, !user.active);
          dialog.current?.close();
        }}
      >
        {t("deactivateAccount")}
      </Button>

      <Button
        theme="secondary"
        onClick={() => {
          dialog.current?.close();
        }}
      >
        {t("cancel")}
      </Button>
    </div>
  );

  return (
    <div className="form-builder">
      <Dialog
        title={t("deactivateThisAccount")}
        dialogRef={dialog}
        actions={actions}
        className="max-h-[80%] overflow-y-scroll"
        handleClose={handleClose}
      >
        <div className="my-8 mx-5 flex flex-col gap-4">
          <p>{t("deactivatingWillNotifyUser")}</p>
          <p>
            {user.name} <br />
            {user.email}
          </p>
        </div>
      </Dialog>
    </div>
  );
};
