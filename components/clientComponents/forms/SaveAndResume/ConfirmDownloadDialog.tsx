"use client";

import { useCallback, useRef, useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useTranslation } from "@i18n/client";
import Markdown from "markdown-to-jsx";

import { type FormValues } from "@lib/formContext";
import { type Language } from "@lib/types/form-builder-types";

import { Button } from "@clientComponents/globals";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { slugify } from "@lib/client/clientHelpers";
import { getReviewItems } from "../Review/helpers";
import { getStartLabels } from "@lib/utils/form-builder/i18nHelpers";
import { toast } from "@formBuilder/components/shared/Toast";

import { generateDownloadHtml } from "@lib/saveAndResume/actions";

export type handleCloseType = (value: boolean) => void;

declare global {
  interface Window {
    showSaveFilePicker: ({}) => Promise<FileSystemFileHandle>;
    createWritable: () => Promise<FileSystemWritableFileStream>;
  }
}

async function promptToSave(fileName: string, data: string) {
  const handle = await window?.showSaveFilePicker({
    suggestedName: fileName,
    types: [
      {
        description: "Form Progress (Save to resume later)",
        accept: { "text/html": [".html"] },
      },
    ],
  });

  const writable = await handle.createWritable();
  await writable.write(data);
  await writable.close();
}

export const ConfirmDownloadDialog = ({
  open,
  type,
  handleClose,
  formId,
  formTitleEn,
  formTitleFr,
  language,
}: {
  open: boolean;
  type: "confirm" | "progress";
  handleClose: handleCloseType;
  formId: string;
  formTitleEn: string;
  formTitleFr: string;
  language: Language;
}) => {
  const { t } = useTranslation("form-builder");

  const {
    groups,
    getValues,
    formRecord,
    getGroupHistory,
    matchedIds,
    getProgressData,
    submissionId,
    submissionDate,
  } = useGCFormsContext();
  const [saving, setSaving] = useState(false);

  const formValues: void | FormValues = getValues();
  const groupHistoryIds = getGroupHistory();
  if (!formValues || !groups) throw new Error("Form values or groups are missing");

  const reviewItems = getReviewItems({
    formElements: formRecord.form.elements,
    formValues,
    groups,
    groupHistoryIds,
    matchedIds,
    language,
  });

  const tParent = type === "confirm" ? "saveResponse" : "saveAndResume";
  const generateHtmlError = t("saveResponse.downloadHtml.generateHtmlError.description", {
    lng: language,
    ns: "common",
  });

  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);

      const title = language === "en" ? formTitleEn : formTitleFr;

      const fileName = `${slugify(title)}-${formId}.html`;

      const options = {
        formTitle: title,
        type,
        formId,
        reviewItems,
        formResponse: btoa(JSON.stringify(getProgressData())),
        language,
        startSectionTitle: getStartLabels()[language],
        submissionId,
        submissionDate,
      };

      const html = await generateDownloadHtml(options);

      if (!html.data || html.data === "") {
        setSaving(false);
        throw new Error("Error generating download progress html");
      }

      if (!window?.showSaveFilePicker) {
        const downloadLink = document.createElement("a");
        const blob = new Blob([html.data], { type: "text/html" });
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = fileName;
        downloadLink.click();
        URL.revokeObjectURL(downloadLink.href);
      } else {
        await promptToSave(fileName, html.data);
      }
      setSaving(false);
    } catch (error) {
      setSaving(false);
      toast.error(generateHtmlError, "public-facing-form");
    }
  }, [
    formId,
    type,
    formTitleEn,
    formTitleFr,
    getProgressData,
    language,
    reviewItems,
    submissionId,
    submissionDate,
    generateHtmlError,
  ]);

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
            <Markdown options={{ forceBlock: false }}>
              {t(`${tParent}.prompt.description`)}
            </Markdown>
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
