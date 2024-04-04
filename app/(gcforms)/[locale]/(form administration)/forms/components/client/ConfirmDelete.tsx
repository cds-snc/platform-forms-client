import React, { useCallback, useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { ConfirmFormDeleteDialog } from "@formBuilder/components/shared";
import { toast, ToastContainer } from "@formBuilder/components/shared/Toast";
import { deleteForm } from "../../actions";
import { logMessage } from "@lib/logger";

// Note: copied from accounts manage-forms.
// If there are no difference this component should become a shared component
export const ConfirmDelete = ({
  show,
  id,
  isPublished,
  handleClose,
  onDeleted,
}: {
  show: string | boolean | string[] | undefined;
  id: string;
  isPublished: boolean;
  handleClose: (arg: boolean) => void;
  onDeleted: (arg: string) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const handleConfirm = useCallback(async () => {
    logMessage.info("Start delete form " + id);
    await deleteForm(id)
      .then(() => {
        logMessage.info("Form deleted with id " + id);
        onDeleted(id);
      })
      .catch((error) => {
        logMessage.debug(error);
        if ((error as Error).message === "Responses Exist") {
          toast.error(t("formDeletedResponsesExist"));
        } else {
          toast.error(t("formDeletedDialogMessageFailed"));
        }
      });
  }, [id, onDeleted, t]);

  useEffect(() => {
    if (show) {
      logMessage.info("Show delete form dialog");
    }
  }, [show]);

  return (
    <>
      {show && (
        <ConfirmFormDeleteDialog
          formId={id}
          handleClose={() => handleClose(false)}
          handleConfirm={handleConfirm}
          isPublished={isPublished}
        />
      )}
      <div className="sticky top-0">
        <ToastContainer autoClose={false} containerId="default" />
      </div>
    </>
  );
};
