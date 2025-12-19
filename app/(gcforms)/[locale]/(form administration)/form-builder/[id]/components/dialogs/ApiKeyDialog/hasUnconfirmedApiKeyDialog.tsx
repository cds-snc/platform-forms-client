"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";

import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

type APIKeyCustomEventDetails = {
  id: string;
  actionType: "generate" | "delete";
};

/**
 * UnconfirmedApiKeyDialog
 * @returns JSX.Element
 */
export const UnconfirmedApiKeyDialog = () => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t, i18n } = useTranslation("form-builder");
  const router = useRouter();

  // Setup + Open dialog
  const [isOpen, setIsOpen] = useState(false);
  const [formId, setFormId] = useState<string>("");
  const [actionType, setActionType] = useState<"generate" | "delete">("generate");

  const handleOpen = useCallback((detail: APIKeyCustomEventDetails) => {
    if (detail) {
      setFormId(detail.id);
      setActionType(detail.actionType);
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

  const handleRedirectToResponses = () => {
    handleClose();
    router.push(`/${i18n.language}/form-builder/${formId}/responses`);
  };

  const actions = (
    <>
      <Button theme="primary" className="mr-5" onClick={handleRedirectToResponses}>
        {t("settings.api.hasUnconfirmedDownloads.ctaButton")}
      </Button>
      <Button theme="secondary" onClick={handleClose}>
        {t("settings.api.hasUnconfirmedDownloads.cancelButton")}
      </Button>
    </>
  );

  const dialogTitle =
    actionType === "generate"
      ? t("settings.api.hasUnconfirmedDownloads.generateAction.title")
      : t("settings.api.hasUnconfirmedDownloads.deleteAction.title");

  return (
    <>
      {isOpen && (
        <Dialog handleClose={handleClose} dialogRef={dialog} actions={actions} title={dialogTitle}>
          <p className="p-4">{t("settings.api.hasUnconfirmedDownloads.message")}</p>
        </Dialog>
      )}
    </>
  );
};
