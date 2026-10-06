"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { Alert, Button } from "@clientComponents/globals";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { toast } from "@formBuilder/components/shared/Toast";
import { useTranslation } from "@i18n/client";
import { CopyIcon, HistoryIcon, UploadIcon } from "@serverComponents/icons";
import { FormProperties } from "@lib/types";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { clearTemplateStore } from "@lib/store/utils";
import {
  DOWNLOADABLE_TEMPLATE_VERSION_LABEL,
  DownloadableTemplateVersion,
} from "@lib/templates/types";
import { getDownloadableFormVersions } from "../../../settings/actions";
import { createDraftVersion } from "./actions";
import { DraftSourceOption, type DraftSource } from "./DraftSourceOption";
import { useTemplateUpload } from "./useTemplateUpload";

type OpenDetail = { id: string };

export const CreateDraftConfirmDialog = () => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t, i18n } = useTranslation("form-builder");
  const router = useRouter();
  const { getFlag } = useFeatureFlags();
  const {
    uploadInput,
    uploadedConfig,
    uploadedFileName,
    uploadErrors,
    handleUpload,
    resetUpload,
    clearUploadErrors,
  } = useTemplateUpload((key) => Boolean(getFlag(key)));

  const [isOpen, setIsOpen] = useState(false);
  const [formId, setFormId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selection, setSelection] = useState<DraftSource>("current");
  const [versions, setVersions] = useState<DownloadableTemplateVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState("");

  const handleOpen = useCallback(
    async (detail: OpenDetail) => {
      if (detail && detail.id) {
        setFormId(detail.id);
        setSelection("current");
        setVersions([]);
        setSelectedVersion("");
        resetUpload();
        setIsOpen(true);

        const result = await getDownloadableFormVersions(detail.id);
        if ("versions" in result) {
          const previousVersions = result.versions.filter(
            (version) => version.label === DOWNLOADABLE_TEMPLATE_VERSION_LABEL.published
          );
          setVersions(previousVersions);
          setSelectedVersion(previousVersions[0]?.id ?? "");
        }
      }
    },
    [resetUpload]
  );

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
    setSelection("current");
    resetUpload();
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      const formConfig: FormProperties | undefined = uploadedConfig;
      let sourceVersionId: string | undefined;
      if (selection === "previous") {
        sourceVersionId = selectedVersion;
      }

      if (selection === "upload" && !formConfig) {
        toast.error(t("confirm.createDraft.errors.invalidFile"));
        setIsSubmitting(false);
        return;
      }

      const res = await createDraftVersion({ id: formId, formConfig, sourceVersionId });
      if (res?.error || !res?.formRecord) {
        toast.error(t("confirm.createDraft.errors.create"));
        setIsSubmitting(false);
        return;
      }

      handleClose();
      clearTemplateStore();
      // Navigate to edit page for the draft
      const lang = i18n.language || "en";
      router.push(`/${lang}/form-builder/${res.formRecord.id}/edit`);
    } catch (e) {
      toast.error(t("confirm.createDraft.errors.create"));
      setIsSubmitting(false);
    }
  };

  const optionChildren = (value: DraftSource) => {
    if (value === "previous" && selection === "previous") {
      return (
        <div className="relative mt-5 ml-10 w-[calc(100%-2.5rem)]">
          <select
            className="gc-select w-full appearance-none rounded-md border-2 border-slate-300 bg-white py-2 pr-10 pl-3 text-slate-900"
            value={selectedVersion}
            onChange={(event) => setSelectedVersion(event.target.value)}
            disabled={versions.length === 0}
          >
            {versions.map((version) => (
              <option key={version.id} value={version.id}>
                {t("formDownload.versionSelector.previousVersion", {
                  version: version.versionNumber,
                })}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="#0f172a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      );
    }

    if (value === "upload" && selection === "upload") {
      return (
        <>
          <button
            type="button"
            className="focus:border-gcds-blue-vivid mt-5 ml-10 rounded border-2 border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 underline hover:border-slate-500"
            onClick={() => {
              resetUpload();
              uploadInput.current?.click();
            }}
          >
            {t("confirm.createDraft.browse")}
          </button>
          {uploadedFileName && (
            <p className="mt-2 ml-10 text-sm text-slate-700">{uploadedFileName}</p>
          )}
          <input
            ref={uploadInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleUpload}
          />
        </>
      );
    }

    return null;
  };

  const options = (
    <>
      <DraftSourceOption
        value="current"
        title={t("confirm.createDraft.options.current.title")}
        icon={<CopyIcon aria-hidden="true" />}
        isSelected={selection === "current"}
        selectedLabel={t("confirm.createDraft.selected")}
        onSelect={() => {
          clearUploadErrors();
          setSelection("current");
        }}
      />
      {versions.length > 0 && (
        <DraftSourceOption
          value="previous"
          title={t("confirm.createDraft.options.previous.title")}
          description={t("confirm.createDraft.options.previous.description")}
          icon={<HistoryIcon aria-hidden="true" />}
          isSelected={selection === "previous"}
          selectedLabel={t("confirm.createDraft.selected")}
          onSelect={() => {
            clearUploadErrors();
            setSelection("previous");
          }}
        >
          {optionChildren("previous")}
        </DraftSourceOption>
      )}
      <DraftSourceOption
        value="upload"
        title={t("confirm.createDraft.options.upload.title")}
        description={t("confirm.createDraft.options.upload.description")}
        icon={<UploadIcon aria-hidden="true" />}
        isSelected={selection === "upload"}
        selectedLabel={t("confirm.createDraft.selected")}
        onSelect={() => setSelection("upload")}
      >
        {optionChildren("upload")}
      </DraftSourceOption>
    </>
  );

  const actions = (
    <>
      <Button theme="secondary" onClick={handleClose} disabled={isSubmitting}>
        {t("actions.cancel")}
      </Button>
      <Button
        theme="primary"
        className="ml-4"
        onClick={handleContinue}
        disabled={isSubmitting || (selection === "upload" && !uploadedConfig)}
      >
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
            <p className="mb-5">{t("confirm.createDraft.liveForm")}</p>

            <div className="mb-5">
              <p className="mb-2 font-bold">{t("confirm.createDraft.list.title")}</p>
              <ul>
                <li>{t("confirm.createDraft.list.listitem1")}</li>
                <li>{t("confirm.createDraft.list.listitem2")}</li>
                <li>{t("confirm.createDraft.list.listitem3")}</li>
              </ul>
            </div>

            {uploadErrors.length > 0 && (
              <Alert.Danger focussable={true} className="mb-4">
                <Alert.Title headingTag="h3">{t("confirm.createDraft.errors.title")}</Alert.Title>
                <ul className="list-disc pl-5">
                  {uploadErrors.map((error, index) => (
                    <li key={`${error.message}-${index}`}>
                      {t(error.message, { property: error.property })}
                    </li>
                  ))}
                </ul>
              </Alert.Danger>
            )}

            <div className="flex flex-col gap-3">{options}</div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default CreateDraftConfirmDialog;
