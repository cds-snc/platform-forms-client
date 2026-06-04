"use client";

import { useCallback, useRef, useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useTranslation } from "@i18n/client";

import { type FormValues } from "@gcforms/types";
import { type Language } from "@lib/types/form-builder-types";

import { Button } from "@clientComponents/globals";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { useFormSubmissionData } from "@lib/hooks/useFormSubmissionData";
import { toast } from "@formBuilder/components/shared/Toast";

import { generateResponseProgressHtml } from "@lib/saveAndResume/generateResponseProgressHtml";
import { downloadDataAsBlob } from "@lib/downloadDataAsBlob";
import { logMessage } from "@lib/logger";

import { SaveFileWarning } from "./FileWarning/SaveFileWarning";

export type handleCloseType = () => void;

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
      const html = await generateResponseProgressHtml(getOptions());

      if (!html.data || html.data === "") {
        throw new Error("Error generating download progress html");
      }

      await downloadDataAsBlob(html.data, fileName, { "text/html": [".html"] });
      return true;
    } catch (error) {
      logMessage.error(error);
      toast.error(generateHtmlError, "public-facing-form");
      return false;
    } finally {
      setSaving(false);
    }
  }, [generateHtmlError, fileName, getOptions]);

  const doClose = () => {
    handleClose();
    previousActiveElement.current?.focus();
  };

  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-200 h-screen w-screen bg-gray-500/70" />
        <AlertDialog.Content
          className="fixed top-1/2 left-1/2 z-201 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-2xl"
          onOpenAutoFocus={() =>
            (previousActiveElement.current = document.activeElement as HTMLElement)
          }
          onCloseAutoFocus={doClose}
          onEscapeKeyDown={doClose}
          aria-describedby="alert-dialog-description"
        >
          <AlertDialog.Title className="text-2xl leading-tight font-extrabold">
            {t(`${tParent}.prompt.title`)}
          </AlertDialog.Title>
          <div id="alert-dialog-description">
            {tParent === "saveAndResume" && (
              <>
                {open && <SaveFileWarning formValues={formValues} type={type} />}
                <ol className="list-outside list-decimal">
                  <li className="marker:text-2xl marker:font-bold">
                    {t(`${tParent}.prompt.text1`)}
                  </li>
                  <li className="marker:text-2xl marker:font-bold">
                    {t(`${tParent}.prompt.text2`)}
                  </li>
                </ol>
                <div className="mt-6 mb-2 ml-6 font-bold italic">
                  {t(`${tParent}.prompt.text3`)}
                </div>
              </>
            )}
            {/* Show save response text */}
            {type === "confirm" && (
              <>
                {open && <SaveFileWarning formValues={formValues} type={type} />}
                <div className="mt-6 mb-4">{t(`${tParent}.prompt.description`)}</div>
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: 15, justifyContent: "flex-end" }}>
            <AlertDialog.Cancel asChild>
              <Button onClick={handleClose} theme="secondary">
                {t(`${tParent}.prompt.cancel`)}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                disabled={saving}
                onClick={async () => {
                  const saved = await handleSave();
                  if (saved) {
                    handleClose();
                  }
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
