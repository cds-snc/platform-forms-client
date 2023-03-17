import React from "react";
import { useTranslation } from "next-i18next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import { ConfirmFormDeleteDialog } from "./shared";
import { useTemplateStore, clearTemplateStore } from "../store";
import { useDeleteForm } from "../hooks";

export const ConfirmDelete = ({
  show,
  handleClose,
  id,
  isPublished,
}: {
  show: string | boolean | string[] | undefined;
  handleClose: (arg: boolean) => void;
  id: string;
  isPublished: boolean;
}) => {
  const { t } = useTranslation("form-builder");
  const { handleDelete } = useDeleteForm();
  const { initialize } = useTemplateStore((s) => ({
    initialize: s.initialize,
  }));

  return (
    <>
      {show && (
        <ConfirmFormDeleteDialog
          handleClose={() => handleClose(false)}
          handleConfirm={async () => {
            const position = toast.POSITION.TOP_CENTER;
            const result = await handleDelete(id);
            if (result && "error" in result) {
              toast.error(t("formDeletedDialogMessageFailed"), { position, autoClose: false });
              return;
            }

            toast.success(t("formDeletedDialogMessage"), { position });
            clearTemplateStore();
            initialize(); // Reset the form
          }}
          isPublished={isPublished}
        />
      )}
      <div className="sticky top-0">
        <ToastContainer />
      </div>
    </>
  );
};
