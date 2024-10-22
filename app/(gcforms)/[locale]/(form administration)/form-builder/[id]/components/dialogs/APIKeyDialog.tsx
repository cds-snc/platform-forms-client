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

import { cn } from "@lib/utils";

export const TextInput = ({
  label,
  required,
  description,
  children,
}: {
  label: string;
  required: React.ReactElement | null;
  description: string;
  children: React.ReactElement;
}) => {
  return (
    <div className="mb-4">
      <label className="mb-2 block font-bold">
        {label} {required && required}
      </label>
      <p className="mb-4">{description}</p>
      {children}
    </div>
  );
};

const ConfirmationAgreement = ({
  handleAgreement,
}: {
  handleAgreement: (value: string) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const [agreeValue, setAgreeValue] = useState("");

  return (
    <div className="mb-4 ">
      <TextInput
        label={t("settings.api.dialog.confirm.label")}
        required={
          <span className="text-gcds-red-500">{t("settings.api.dialog.confirm.required")}</span>
        }
        description={t("settings.api.dialog.confirm.description")}
      >
        <div>
          <input
            type="text"
            className="gc-input-text mb-1 w-4/5"
            value={agreeValue}
            onChange={(e) => {
              setAgreeValue(e.target.value);
              handleAgreement(e.target.value);
            }}
          />
        </div>
      </TextInput>
    </div>
  );
};

export const ApiKeyDialog = () => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t } = useTranslation("form-builder");
  const [handler, setHandler] = useState<APIKeyCustomEventDetails | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    dialog.current?.close();
    handler?.cancel();
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

  const [agreed, setAgreed] = useState(false);

  const hasAgreed = (value: string) => {
    if (value === "AGREE") {
      setAgreed(true);
    } else {
      setAgreed(false);
    }
  };

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
        <Dialog
          handleClose={handleClose}
          dialogRef={dialog}
          actions={actions}
          title={t("settings.api.dialog.title")}
        >
          <div className="p-5">
            <h4 className="mb-4">{t("settings.api.dialog.heading")}</h4>
            <p className="font-bold">{t("settings.api.dialog.responsibility")}</p>
            <ul className="mb-4">
              <li>{t("settings.api.dialog.responsibility1")}</li>
              <li>{t("settings.api.dialog.responsibility2")}</li>
              <li>{t("settings.api.dialog.responsibility3")}</li>
              <li>{t("settings.api.dialog.responsibility4")}</li>
            </ul>

            <ConfirmationAgreement handleAgreement={hasAgreed} />

            <p className="font-bold">{t("settings.api.dialog.text1")}</p>
            <p>{t("settings.api.dialog.text2")}</p>
          </div>
        </Dialog>
      )}
    </>
  );
};
