"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { Button } from "@clientComponents/globals";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import ConfirmationAgreement from "./ConfirmationAgreement";
import { toast } from "@formBuilder/components/shared/Toast";
import { useTranslation } from "@i18n/client";
import { createDraftVersion } from "./actions";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";

type OpenDetail = { id: string };

export const CreateDraftConfirmDialog = () => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t, i18n } = useTranslation("form-builder");
  const router = useRouter();
  const { hasApiKeyId } = useFormBuilderConfig();

  const [isOpen, setIsOpen] = useState(false);
  const [formId, setFormId] = useState<string>("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = useCallback((detail: OpenDetail) => {
    if (detail && detail.id) {
      setFormId(detail.id);
      setAgreed(false);
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    Event.on(EventKeys.openCreateDraftConfirmDialog, handleOpen);
    return () => {
      Event.off(EventKeys.openCreateDraftConfirmDialog, handleOpen);
    };
  }, [Event, handleOpen]);

  const handleAgreement = (value: string) => {
    if (value === "AGREE" || value === "ACCEPTE") setAgreed(true);
    else setAgreed(false);
  };

  const handleClose = () => {
    dialog.current?.close();
    setIsOpen(false);
    setAgreed(false);
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      const res = await createDraftVersion({ id: formId });
      if (res?.error || !res?.formRecord) {
        toast.error("Could not create draft version");
        setIsSubmitting(false);
        return;
      }
      // Navigate to edit page for the draft
      const lang = i18n.language || "en";
      router.push(`/${lang}/form-builder/${res.formRecord.id}/edit`);
    } catch (e) {
      toast.error("Could not create draft version");
      setIsSubmitting(false);
    }
  };

  const actions = (
    <>
      <Button theme="secondary" onClick={handleClose} disabled={isSubmitting}>
        {t("actions.cancel") || "Cancel"}
      </Button>
      <Button
        theme="primary"
        className="ml-4"
        onClick={handleContinue}
        disabled={!agreed || isSubmitting}
      >
        {isSubmitting
          ? t("actions.continue") || "Continuing..."
          : t("actions.continue") || "Continue"}
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
          title={t("confirm.createDraft.title") || "Create draft version"}
        >
          <div className="p-4">
            <p className="mb-4">{t("confirm.createDraft.description")}</p>
            {hasApiKeyId ? (
              <p className="text-warning mb-4 font-medium">{t("confirm.createDraft.apiWarning")}</p>
            ) : (
              <p className="text-warning mb-4 font-medium">
                {t("confirm.createDraft.responseWarning")}
              </p>
            )}
            <p className="mb-4">{t("confirm.createDraft.liveForm")}</p>
            <p className="mb-4 font-semibold">{t("confirm.createDraft.prompt")}</p>
            <ConfirmationAgreement handleAgreement={handleAgreement} />
          </div>
        </Dialog>
      )}
    </>
  );
};

export default CreateDraftConfirmDialog;
