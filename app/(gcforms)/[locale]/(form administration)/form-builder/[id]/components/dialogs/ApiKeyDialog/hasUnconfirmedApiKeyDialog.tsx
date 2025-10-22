"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

type APIKeyCustomEventDetails = {
  id: string;
};

/**
 * UnconfirmedApiKeyDialog
 * @returns JSX.Element
 */
export const UnconfirmedApiKeyDialog = () => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t } = useTranslation("form-builder");

  // Setup + Open dialog
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback((detail: APIKeyCustomEventDetails) => {
    if (detail) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    Event.on(EventKeys.openUnconfirmedApiKeyDialog, handleOpen);
    return () => {
      Event.off(EventKeys.openApiKeyDialog, handleOpen);
    };
  }, [Event, handleOpen]);

  // Actions
  const handleClose = () => {
    dialog.current?.close();
    setIsOpen(false);
  };

  const actions = (
    <>
      <Button theme="secondary" onClick={handleClose}>
        {t("settings.api.dialog.cancelButton")}
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
          title={t("settings.api.hasUnconfirmedDownloads.title")}
        >
          <p className="p-4">{t("settings.api.hasUnconfirmedDownloads.message")}</p>
        </Dialog>
      )}
    </>
  );
};
