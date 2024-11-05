"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";

import { Trans } from "react-i18next";

import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

import { SubmitButton as DeleteButton } from "@clientComponents/globals/Buttons/SubmitButton";
import * as Alert from "@clientComponents/globals/Alert/Alert";
import { logMessage } from "@lib/logger";
import { DeleteKeyFailed } from "./DeleteKeyFailed";
import { DeleteKeySuccess } from "./DeleteKeySuccess";
import { toast } from "@formBuilder/components/shared";

import { deleteServiceAccountKey } from "../../../settings/api/actions";
import Link from "next/link";

type APIKeyCustomEventDetails = {
  id: string;
};

export const DeleteApiKeyDialog = () => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t, i18n } = useTranslation("form-builder");

  const [deleting, setDeleting] = useState(false);

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
    try {
      setDeleting(true);
      const result = await deleteServiceAccountKey(id);
      if (result.error) {
        toast.success(<DeleteKeyFailed />, "wide");
        setDeleting(false);
        return;
      }

      toast.success(<DeleteKeySuccess id={id} />, "wide");
      setDeleting(false);
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

      <DeleteButton
        loading={deleting}
        theme="destructive"
        onClick={handleDelete}
        className={cn("ml-5")}
      >
        {t("settings.api.deleteApiKeyDialog.deleteKeyButton")}
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
            <h3 className="text-lg font-bold">{t("settings.api.deleteApiKeyDialog.lastUsed")}</h3>
            <h4 className="mb-2 text-2xl font-bold">
              {t("settings.api.deleteApiKeyDialog.cautionTitle")}
            </h4>
            <p className="mb-4">{t("settings.api.deleteApiKeyDialog.cautionText")}</p>
            <Trans
              ns="form-builder"
              i18nKey="settings.api.deleteApiKeyDialog.stopText"
              defaults="<strong></strong> <a></a>"
              components={{ strong: <strong />, a: <a /> }}
            />{" "}
            <Link
              className="inline-block"
              href={`${i18n.language}/form-builder/${id}/settings/manage`}
            >
              <span>{t("settings.api.deleteApiKeyDialog.stopText1")}</span>
            </Link>{" "}
            <span>{t("settings.api.deleteApiKeyDialog.stopText2")}</span>
          </div>
        </Dialog>
      )}
    </>
  );
};
