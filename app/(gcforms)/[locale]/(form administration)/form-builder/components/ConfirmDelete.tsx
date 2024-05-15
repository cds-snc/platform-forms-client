import React, { useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { ConfirmFormDeleteDialog } from "./shared";
import { toast, ToastContainer } from "./shared/Toast";
import axios, { AxiosError, AxiosResponse } from "axios";
import { clearTemplateStorage } from "@lib/store/useTemplateStore";

const handleDelete = async (formID?: string): Promise<AxiosResponse | { error: AxiosError }> => {
  try {
    const result = await axios({
      url: `/api/templates/${formID}`,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });
    return result as AxiosResponse;
  } catch (err) {
    return { error: err as AxiosError };
  }
};

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

    clearTemplateStorage(id);
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
