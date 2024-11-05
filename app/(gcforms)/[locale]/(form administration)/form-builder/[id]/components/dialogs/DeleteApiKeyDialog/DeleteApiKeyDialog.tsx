"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

import { SubmitButton as DeleteButton } from "@clientComponents/globals/Buttons/SubmitButton";
import * as Alert from "@clientComponents/globals/Alert/Alert";
import { logMessage } from "@lib/logger";

type APIKeyCustomEventDetails = {
  id: string;
};

export const DeleteApiKeyDialog = () => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t } = useTranslation("form-builder");

  // Setup + Open dialog
  const [id, setId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const [hasError, setHasError] = useState(false);

  const handleOpen = useCallback((detail: APIKeyCustomEventDetails) => {
    if (detail) {
      detail.id && setId(detail.id);
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    Event.on(EventKeys.openDeleteApiKeyDialog, handleOpen);
    return () => {
      Event.off(EventKeys.openDeleteApiKeyDialog, handleOpen);
    };
  }, [Event, handleOpen]);

  // Actions
  const handleClose = () => {
    dialog.current?.close();
    setHasError(false);
    setIsOpen(false);
  };

  const handleDelete = async () => {
    setHasError(false);

    alert(id);

    try {
      dialog.current?.close();
      setIsOpen(false);
    } catch (error) {
      logMessage.error(error);
      setHasError(true);
    }
  };

  const actions = (
    <>
      <Button theme="secondary" onClick={handleClose}>
        {t("settings.api.dialog.cancelButton")}
      </Button>

      <DeleteButton loading={false} theme="destructive" onClick={handleDelete}>
        {t("settings.api.deleteApiKeyDialog.cancelButton")}
      </DeleteButton>
    </>
  );

  return (
    <>
      {isOpen && (
        <Dialog
          handleClose={handleClose}
          dialogRef={dialog}
          actions={actions}
          title={t("settings.api.deleteApiKeyDialog.title")}
        >
          <div className="p-5">
            {hasError && (
              <Alert.Danger className="mb-4">
                <Alert.Title headingTag="h3">
                  {t("settings.api.deleteApiKeyDialog.error.deleteFailed.title")}
                </Alert.Title>
                <p className="mb-2">
                  {t("settings.api.deleteApiKeyDialog.error.deleteFailed.message")}{" "}
                </p>
              </Alert.Danger>
            )}
            <p>{t("settings.api.deleteApiKeyDialog.lastUsed")}</p>

            <p>{t("settings.api.deleteApiKeyDialog.cautionTitle")}</p>

            <p>{t("settings.api.deleteApiKeyDialog.cautionText")}</p>

            <p>{t("settings.api.deleteApiKeyDialog.stopText")}</p>
          </div>
        </Dialog>
      )}
    </>
  );
};
