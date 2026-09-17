import React, { useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { ConfirmFormDeleteDialog } from "@formBuilder/components/shared/ConfirmFormDeleteDialog";
import { toast, ToastContainer } from "@formBuilder/components/shared/Toast";
import { deleteDraftForm, deleteForm } from "../../actions";
import { clearTemplateStorage } from "@lib/store/utils";

// Note: copied from accounts manage-forms.
// If there are no difference this component should become a shared component
export const ConfirmDelete = ({
  show,
  id,
  isPublished,
  isDraftVersion = false,
  handleClose,
  onDeleted,
}: {
  show: string | boolean | string[] | undefined;
  id: string;
  isPublished: boolean;
  isDraftVersion?: boolean;
  handleClose: (arg: boolean) => void;
  onDeleted: (arg: string) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const handleConfirm = useCallback(async () => {
    const { error } = (await (isDraftVersion ? deleteDraftForm(id) : deleteForm(id))) ?? {};
    if (error) {
      if (error === "Responses Exist") {
        toast.error(t("formDeletedResponsesExist"));
      } else {
        toast.error(t("formDeletedDialogMessageFailed"));
      }
    }

    clearTemplateStorage(id);

    // Remove the element from the DOM after deletion
    // Avoids the need to refresh the page etc... for the minor change to take effect
    const el = document?.getElementById(id);
    if (el) {
      el.remove();
    }
    onDeleted(id);
  }, [id, isDraftVersion, onDeleted, t]);

  return (
    <>
      {show && (
        <ConfirmFormDeleteDialog
          formId={id}
          handleClose={() => handleClose(false)}
          handleConfirm={handleConfirm}
          isPublished={isPublished && !isDraftVersion}
          isDraftVersion={isDraftVersion}
        />
      )}
      <div className="sticky top-0">
        <ToastContainer autoClose={false} containerId="default" />
      </div>
    </>
  );
};
