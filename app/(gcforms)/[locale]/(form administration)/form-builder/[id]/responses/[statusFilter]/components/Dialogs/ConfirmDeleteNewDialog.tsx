"use client";
import React from "react";
import {
  Dialog,
  useDialogRef,
} from "app/(gcforms)/[locale]/(form administration)/form-builder/components/shared";
import { Alert, Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";

export const ConfirmDeleteNewDialog = ({
  isVisible,
  setIsVisible,
}: {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const dialogRef = useDialogRef();
  const [deleteDisabled, setDeleteDisabled] = React.useState(true);
  const { t } = useTranslation("form-builder-responses");

  const handleClose = () => {
    setIsVisible(false);
    setDeleteDisabled(true);
    dialogRef.current?.close();
  };

  const handleSubmit = () => {
    alert("not yet implemented");
  };

  const checkDeleteInput = (value: string) => {
    if (value === t("downloadResponsesModals.confirmDeleteNewDialog.deleteConfirmationString")) {
      setDeleteDisabled(false);
    } else {
      setDeleteDisabled(true);
    }
  };

  return (
    <>
      {isVisible && (
        <Dialog
          title={t("downloadResponsesModals.confirmDeleteNewDialog.confirmAndDelete")}
          dialogRef={dialogRef}
          handleClose={handleClose}
        >
          <div className="p-4">
            <Alert.Danger>
              <Alert.Title>
                {t("downloadResponsesModals.confirmDeleteNewDialog.responsesNotYetDownloaded")}
              </Alert.Title>
              <Alert.Body>
                {t("downloadResponsesModals.confirmDeleteNewDialog.alertBody")}
              </Alert.Body>
            </Alert.Danger>

            <label htmlFor="confirmDelete" className="my-4 block font-semibold">
              {t("downloadResponsesModals.confirmDeleteNewDialog.deletePrompt")}
              <span className="ml-2 text-red">
                ({t("downloadResponsesModals.confirmDeleteNewDialog.required")})
              </span>
            </label>
            <input
              type="text"
              name="confirmDelete"
              placeholder={t(
                "downloadResponsesModals.confirmDeleteNewDialog.deleteConfirmationString"
              )}
              className="gc-input-text w-full"
              onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) =>
                checkDeleteInput(e.currentTarget.value)
              }
            />

            <div className="mt-8 flex gap-4">
              <Button theme="secondary" onClick={handleClose}>
                {t("downloadResponsesModals.confirmDeleteNewDialog.cancel")}
              </Button>
              <Button
                theme="destructive"
                className="mr-4"
                onClick={handleSubmit}
                disabled={deleteDisabled}
              >
                {t("downloadResponsesModals.confirmDeleteNewDialog.delete")}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};
