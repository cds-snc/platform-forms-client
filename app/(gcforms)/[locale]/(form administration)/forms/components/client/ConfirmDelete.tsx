import React, { useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { ConfirmFormDeleteDialog } from "@formBuilder/components/shared";
import { toast, ToastContainer } from "@formBuilder/components/shared/Toast";
import { deleteForm } from "../../actions";

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
    const { error } = (await deleteForm(id)) ?? {};
    if (error) {
      if (error === "Responses Exist") {
        toast.error(t("formDeletedResponsesExist"));
      } else {
        toast.error(t("formDeletedDialogMessageFailed"));
      }
    }

    onDeleted(id);
  }, [id, onDeleted, t]);

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
