"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";

import { cn } from "@lib/utils";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

import { ResponsibilityList } from "./ResponsibilityList";
import { ConfirmationAgreement } from "./ConfirmationAgreement";
import { Note } from "./Note";
import { downloadKey, _createKey } from "@formBuilder/[id]/settings/api/utils";
import { SubmitButton as DownloadButton } from "@clientComponents/globals/Buttons/SubmitButton";
import * as Alert from "@clientComponents/globals/Alert/Alert";
import { logMessage } from "@lib/logger";

type APIKeyCustomEventDetails = {
  id: string;
};

export const ApiKeyDialog = () => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t } = useTranslation("form-builder");

  // Setup + Open dialog
  const [id, setId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  // Handle loading state for download button
  const [generating, setGenerating] = useState(false);

  const [hasError, setHasError] = useState(false);

  const handleOpen = useCallback((detail: APIKeyCustomEventDetails) => {
    if (detail) {
      detail.id && setId(detail.id);
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    Event.on(EventKeys.openApiKeyDialog, handleOpen);
    return () => {
      Event.off(EventKeys.openApiKeyDialog, handleOpen);
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
  const handleClose = () => {
    dialog.current?.close();
    setHasError(false);
    setIsOpen(false);
  };

  const handleSave = async () => {
    setHasError(false);
    setGenerating(true);
    try {
      const key = await _createKey(id);
      downloadKey(JSON.stringify(key), id);
      setGenerating(false);
      dialog.current?.close();
      setIsOpen(false);
    } catch (error) {
      logMessage.error(error);
      setHasError(true);
      setGenerating(false);
    }
  };

  const actions = (
    <>
      <Button theme="secondary" onClick={handleClose}>
        {t("settings.api.dialog.cancelButton")}
      </Button>
      <DownloadButton
        loading={generating}
        className={cn("ml-5")}
        theme="primary"
        disabled={!agreed || generating}
        onClick={handleSave}
        dataTestId="confirm-download"
      >
        {t("settings.api.dialog.downloadButton")}
      </DownloadButton>
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
            {hasError && (
              <Alert.Danger className="mb-4">
                <Alert.Title headingTag="h3">
                  {t("settings.api.dialog.error.createFailed.title")}
                </Alert.Title>
                <p className="mb-2">{t("settings.api.dialog.error.createFailed.message")} </p>
              </Alert.Danger>
            )}
            <h4 className="mb-4">{t("settings.api.dialog.heading")}</h4>
            <ResponsibilityList />
            <ConfirmationAgreement handleAgreement={hasAgreed} />
            <Note />
          </div>
        </Dialog>
      )}
    </>
  );
};
