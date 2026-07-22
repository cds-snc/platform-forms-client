"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { Button } from "@clientComponents/globals";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { toast } from "@formBuilder/components/shared/Toast";
import { useTranslation } from "@i18n/client";
import { createDraftVersion } from "./actions";

type OpenDetail = { id: string };

export const CreateDraftConfirmDialog = () => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t, i18n } = useTranslation("form-builder");
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [formId, setFormId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = useCallback((detail: OpenDetail) => {
    if (detail && detail.id) {
      setFormId(detail.id);
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    Event.on(EventKeys.openCreateDraftConfirmDialog, handleOpen);
    return () => {
      Event.off(EventKeys.openCreateDraftConfirmDialog, handleOpen);
    };
  }, [Event, handleOpen]);

  const handleClose = () => {
    dialog.current?.close();
    setIsOpen(false);
    setIsSubmitting(false);
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

      handleClose();
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
        {t("actions.cancel")}
      </Button>
      <Button theme="primary" className="ml-4" onClick={handleContinue} disabled={isSubmitting}>
        {isSubmitting ? t("actions.continuing") : t("actions.continue")}
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
          title={t("confirm.createDraft.title")}
        >
          <div className="p-4">
            <p className="mb-4">{t("confirm.createDraft.liveForm")}</p>

            <p className="mb-2 font-bold">{t("confirm.createDraft.list.title")}</p>

            <ul className="mb-8">
              <li>{t("confirm.createDraft.list.listitem1")}</li>
              <li>{t("confirm.createDraft.list.listitem2")}</li>
              <li>{t("confirm.createDraft.list.listitem3")}</li>
            </ul>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default CreateDraftConfirmDialog;
