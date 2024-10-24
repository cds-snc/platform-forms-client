"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";

import { cn } from "@lib/utils";
import { Button } from "@clientComponents/globals";
import { Dialog as BaseDialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

import { ResponsibilityList } from "./ResponsibilityList";
import { ConfirmationAgreement } from "./ConfirmationAgreement";
import { Note } from "./Note";
import { downloadKey, _createKey } from "@formBuilder/[id]/settings/api/utils";
import { SubmitButton as DownloadButton } from "@clientComponents/globals/Buttons/SubmitButton";

type APIKeyCustomEventDetails = {
  id: string;
};

export const Dialog = () => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t } = useTranslation("form-builder");

  // Setup + Open dialog
  const [id, setId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const [generating, setGenerating] = useState(false);

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
  const handleCancel = () => {
    dialog.current?.close();
    setIsOpen(false);
  };

  const handleSave = async () => {
    setGenerating(true);
    const key = await _createKey(id);
    downloadKey(JSON.stringify(key), id);
    setGenerating(false);
    dialog.current?.close();
    setIsOpen(false);
  };

  const actions = (
    <>
      <Button theme="secondary" onClick={handleCancel}>
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
