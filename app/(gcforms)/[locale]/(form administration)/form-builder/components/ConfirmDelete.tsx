"use client";
import React, { useCallback } from "react";
import { useTranslation } from "@i18n/client";

import { ConfirmFormDeleteDialog } from "./shared";
import { clearTemplateStore } from "@lib/store";
import { handleDelete } from "@clientComponents/form-builder/utils";
import { toast, ToastContainer } from "./shared/Toast";

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
    const result = await handleDelete(id);
    if (result && "error" in result) {
      if (
        result.error.response?.status === 405 &&
        (result.error.response?.data as Record<string, unknown> | undefined)?.error ===
          "Found unprocessed submissions"
      ) {
        toast.error(t("formDeletedResponsesExist"));
        return;
      }

      toast.error(t("formDeletedDialogMessageFailed"));

      return;
    }

    clearTemplateStore();
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
