"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";

import { cn } from "@lib/utils";
import { Button } from "@clientComponents/globals";
import { Dialog as BaseDialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { APIKeyCustomEventDetails, EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

import { ResponsibilityList } from "./ResponsibilityList";
import { ConfirmationAgreement } from "./ConfirmationAgreement";
import { Note } from "./Note";

export const Dialog = () => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t } = useTranslation("form-builder");

  // Setup + Open dialog
  const [handler, setHandler] = useState<APIKeyCustomEventDetails | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback((detail: APIKeyCustomEventDetails) => {
    if (detail) {
      setHandler(detail);
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    Event.on<APIKeyCustomEventDetails>(EventKeys.openApiKeyDialog, handleOpen);
    return () => {
      Event.off<APIKeyCustomEventDetails>(EventKeys.openApiKeyDialog, handleOpen);
    };
  }, [Event, handleOpen]);

  // Handle Agreement - state
  const [agreed, setAgreed] = useState(false);

  const hasAgreed = (value: string) => {
    if (value === "AGREE" || value === "ACCEPTE") {
      setAgreed(true);
    } else {
      setAgreed(false);
    }
  };

  // Actions
  const handleCancel = () => {
    handler?.cancel();
    dialog.current?.close();
    setIsOpen(false);
  };

  const handleSave = () => {
    handler?.download();
    dialog.current?.close();
    setIsOpen(false);
  };

  const actions = (
    <>
      <Button theme="secondary" onClick={handleCancel}>
        {t("settings.api.dialog.cancelButton")}
      </Button>
      <Button
        className={cn("ml-5")}
        theme="primary"
        disabled={!agreed}
        onClick={handleSave}
        dataTestId="confirm-download"
      >
        {t("settings.api.dialog.downloadButton")}
      </Button>
    </>
  );

  return (
    <>
      {isOpen && (
        <BaseDialog
          handleClose={handleCancel}
          dialogRef={dialog}
          actions={actions}
          title={t("settings.api.dialog.title")}
        >
          <div className="p-5">
            <h4 className="mb-4">{t("settings.api.dialog.heading")}</h4>
            <ResponsibilityList />
            <ConfirmationAgreement handleAgreement={hasAgreed} />
            <Note />
          </div>
        </BaseDialog>
      )}
    </>
  );
};
