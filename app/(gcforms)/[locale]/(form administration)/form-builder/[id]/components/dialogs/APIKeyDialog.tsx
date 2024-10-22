"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import {
  APIKeyCustomEventDetails,
  CustomEventDetails,
  EventKeys,
  useCustomEvent,
} from "@lib/hooks/useCustomEvent";

export const ApiKeyDialog = () => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t } = useTranslation("form-builder");
  const [handler, setHandler] = useState<APIKeyCustomEventDetails | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    dialog.current?.close();
    setIsOpen(false);
  };

  const handleOpenDialog = useCallback((detail: CustomEventDetails) => {
    if (detail) {
      setHandler(detail);
      setIsOpen(true);
    }
  }, []);

  const handleSave = () => {
    handler?.download();
    handleClose();
  };

  useEffect(() => {
    Event.on(EventKeys.openApiKeyDialog, handleOpenDialog);
    return () => {
      Event.off(EventKeys.openApiKeyDialog, handleOpenDialog);
    };
  }, [Event, handleOpenDialog]);

  const actions = (
    <>
      <Button
        theme="secondary"
        onClick={() => {
          dialog.current?.close();
          handleClose && handleClose();
        }}
      >
        {t("settings.api.dialog.cancelButton")}
      </Button>
      <Button className="ml-5" theme="primary" onClick={handleSave} dataTestId="confirm-delete">
        {t("settings.api.dialog.downloadButton")}
      </Button>
    </>
  );

  return (
    <>
      {isOpen && (
        <Dialog
          handleClose={handleClose}
          dialogRef={dialog}
          actions={actions}
          title={t("settings.api.dialog.title")}
        >
          <div className="p-5">
            <p className="font-bold">{t("settings.api.dialog.text1")}</p>
            <p>{t("settings.api.dialog.text2")}</p>
          </div>
        </Dialog>
      )}
    </>
  );
};
