"use client";

import { useCallback, useRef, useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useTranslation } from "@i18n/client";

import { type FormValues } from "@lib/formContext";
import { type Language } from "@lib/types/form-builder-types";

import { Button } from "@clientComponents/globals";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { useFormSubmissionData } from "@lib/hooks/useFormSubmissionData";
import { toast } from "@formBuilder/components/shared/Toast";

import { generateDownloadHtml } from "@lib/saveAndResume/actions";
import { downloadDataAsBlob } from "@lib/downloadDataAsBlob";

export type handleCloseType = (value: boolean) => void;

export const ConfirmDownloadDialog = ({
  open,
  type,
  handleClose,
  language,
}: {
  open: boolean;
  type: "confirm" | "progress";
  handleClose: handleCloseType;
  language: Language;
}) => {
  const { t } = useTranslation("form-builder");

  const { groups, getValues } = useGCFormsContext();
  const [saving, setSaving] = useState(false);

  const formValues: void | FormValues = getValues();
  if (!formValues || !groups) throw new Error("Form values or groups are missing");

  const { fileName, getOptions } = useFormSubmissionData({ language, type });

  const tParent = type === "confirm" ? "saveResponse" : "saveAndResume";
  const generateHtmlError = t("saveResponse.downloadHtml.generateHtmlError.description", {
    lng: language,
    ns: "common",
  });

  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      const html = await generateDownloadHtml(getOptions());

      if (!html.data || html.data === "") {
        setSaving(false);
        throw new Error("Error generating download progress html");
      }

      await downloadDataAsBlob(html.data, fileName, { "text/html": [".html"] });

      setSaving(false);
    } catch (error) {
      setSaving(false);
      toast.error(generateHtmlError, "public-facing-form");
    }
  }, [generateHtmlError, fileName, getOptions]);

  const doClose = () => {
    handleClose(false);
    previousActiveElement.current?.focus();
  };

  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[200] h-screen w-screen bg-gray-500/70" />
        <AlertDialog.Content
          className="fixed left-1/2 top-1/2 z-[201] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-2xl"
          onOpenAutoFocus={() =>
            (previousActiveElement.current = document.activeElement as HTMLElement)
          }
          onCloseAutoFocus={doClose}
          onEscapeKeyDown={doClose}
        >
          <AlertDialog.Title className="text-2xl font-extrabold leading-tight">
            {t(`${tParent}.prompt.title`)}
          </AlertDialog.Title>
          <AlertDialog.Description className="pb-6">
            <div className="mb-2 flex">
              <span className="mr-4 inline-block text-2xl font-bold"> 1 </span>
              {t(`${tParent}.prompt.text1`)}
            </div>

            <div className="mb-6 flex">
              <span className="mr-4 inline-block text-2xl font-bold"> 2 </span>{" "}
              {t(`${tParent}.prompt.text2`)}
            </div>

            <div className="mb-2 ml-6 font-bold italic">{t(`${tParent}.prompt.text3`)}</div>
          </AlertDialog.Description>
          <div style={{ display: "flex", gap: 15, justifyContent: "flex-end" }}>
            <AlertDialog.Cancel asChild>
              <Button onClick={() => handleClose(false)} theme="secondary">
                {t(`${tParent}.prompt.cancel`)}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                disabled={saving}
                onClick={() => {
                  handleSave();
                  handleClose(true);
                }}
                theme="primary"
              >
                {t(`${tParent}.prompt.okay`)}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
