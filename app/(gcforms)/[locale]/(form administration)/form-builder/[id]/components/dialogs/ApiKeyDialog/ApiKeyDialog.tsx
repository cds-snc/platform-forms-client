"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";

// Save actions
import { downloadKey, _createKey, _regenKey } from "@formBuilder/[id]/settings/components/utils";

import { cn } from "@lib/utils";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { toast } from "@formBuilder/components/shared/Toast";
import { ResponsibilityList } from "./ResponsibilityList";
import { ConfirmationAgreement } from "./ConfirmationAgreement";
import { Note } from "./Note";
import { SubmitButton as DownloadButton } from "@clientComponents/globals/Buttons/SubmitButton";
import * as Alert from "@clientComponents/globals/Alert/Alert";
import { logMessage } from "@lib/logger";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { GenerateKeySuccess } from "./GenerateKeySuccess";

import { type SecurityAttribute } from "@lib/types";

type APIKeyCustomEventDetails = {
  id: string;
  classification: SecurityAttribute;
};

/**
 * API Key Dialog
 * @returns JSX.Element
 */
export const ApiKeyDialog = () => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t } = useTranslation("form-builder");

  // Setup + Open dialog
  const [id, setId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const { updateApiKeyId, hasApiKeyId } = useFormBuilderConfig();

  // Handle loading state for download button
  const [generating, setGenerating] = useState(false);

  const [hasError, setHasError] = useState(false);

  const handleOpen = useCallback((detail: APIKeyCustomEventDetails) => {
    if (detail) {
      detail.id && setId(detail.id);
      setIsOpen(true);
      setAgreed(false);
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
    setAgreed(false);
  };

  const handleSave = async () => {
    setHasError(false);
    setGenerating(true);
    try {
      let key;

      if (hasApiKeyId) {
        key = await _regenKey(id);
      } else {
        key = await _createKey(id);
      }

      await downloadKey(JSON.stringify(key), id);
      setGenerating(false);
      updateApiKeyId(key.keyId);
      toast.success(<GenerateKeySuccess />, "wide");
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

  const dialogTitle = hasApiKeyId
    ? t("settings.api.dialog.refreshTitle")
    : t("settings.api.dialog.title");

  const dialogHeading = hasApiKeyId
    ? t("settings.api.dialog.refreshHeading")
    : t("settings.api.dialog.heading");

  return (
    <>
      {isOpen && (
        <Dialog handleClose={handleClose} dialogRef={dialog} actions={actions} title={dialogTitle}>
          <div className="p-5">
            {hasError && (
              <Alert.Danger className="mb-4">
                <Alert.Title headingTag="h3">
                  {t("settings.api.dialog.error.createFailed.title")}
                </Alert.Title>
                <p className="mb-2">{t("settings.api.dialog.error.createFailed.message")} </p>
              </Alert.Danger>
            )}
            <h3 className="mb-4">{dialogHeading}</h3>
            <ResponsibilityList />
            <ConfirmationAgreement handleAgreement={hasAgreed} />
            <Note />
          </div>
        </Dialog>
      )}
    </>
  );
};
