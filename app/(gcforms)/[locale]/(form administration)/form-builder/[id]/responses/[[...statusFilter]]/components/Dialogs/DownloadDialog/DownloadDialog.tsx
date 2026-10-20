"use client";

/*--------------------------------------------*
 * Framework and Third-Party
 *--------------------------------------------*/
import React, { useEffect } from "react";

/*--------------------------------------------*
 * Internal Aliases
 *--------------------------------------------*/
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { useTranslation } from "@i18n/client";
import { FeatureFlags } from "@lib/cache/types";
import { getDate, slugify } from "@lib/client/clientHelpers";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { logMessage } from "@lib/logger";
import { DownloadFormat } from "@lib/responseDownloadFormats/types";
import {
  FormServerErrorCodes,
  type Language,
  type ServerActionError,
} from "@lib/types/form-builder-types";
import { SpinnerIcon } from "@serverComponents/icons/SpinnerIcon";

/*--------------------------------------------*
 * Local Relative
 *--------------------------------------------*/
import type { DownloadDialogProps } from "./DownloadDialog.types";
import { availableDownloadFormats } from "./downloadResponseFiles";
import type { DownloadProgress } from "./DownloadDialog.types";
import { downloadResponses } from "./downloadResponses";
import { useTemplateVersioning } from "./useTemplateVersioning";
import { VersionSelector } from "./VersionSelector";

export { getVersionedZipFileName } from "./downloadZip";

export const DownloadDialog = ({
  checkedItems,
  isDialogVisible,
  setIsDialogVisible,
  setDownloadError,
  formId,
  formName,
  onSuccessfulDownload,
  responseDownloadLimit,
  checkedMeta = [],
}: DownloadDialogProps) => {
  const dialogRef = useDialogRef();
  const { t, i18n } = useTranslation("form-builder-responses");
  const defaultSelectedFormat = DownloadFormat.HTML_ZIPPED;
  const [selectedFormat, setSelectedFormat] = React.useState<DownloadFormat>(defaultSelectedFormat);
  const [zipAllFiles, setZipAllFiles] = React.useState<boolean>(true);
  const [isDownloading, setIsDownloading] = React.useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = React.useState<DownloadProgress | null>(null);
  const [selectedVersionForDialog, setSelectedVersionForDialog] = React.useState<string | null>(
    null
  );

  const { dialogVersions, getFilteredIds } = useTemplateVersioning(checkedItems, checkedMeta);
  const { getFlag } = useFeatureFlags();
  const fileUploadEnabled = getFlag(FeatureFlags.fileUpload);

  useEffect(() => {
    if (selectedFormat === DownloadFormat.HTML_ZIPPED) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset dependent download option
      setZipAllFiles(true);
    }
  }, [selectedFormat]);

  const handleClose = () => {
    setSelectedFormat(defaultSelectedFormat);
    setZipAllFiles(true);
    setSelectedVersionForDialog(null);
    setDownloadProgress(null);
    setIsDialogVisible(false);
    dialogRef.current?.close();
  };

  const handleDownloadComplete = (filteredIds: string[], hasDownloadFailures = false) => {
    setIsDownloading(false);
    onSuccessfulDownload(filteredIds, hasDownloadFailures);
    handleClose();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(false);
    if (!selectedFormat || !availableDownloadFormats.includes(selectedFormat)) {
      setDownloadError(FormServerErrorCodes.DOWNLOAD_INVALID_FORMAT);
      return;
    }

    if (!checkedItems.size || checkedItems.size > responseDownloadLimit) {
      setDownloadError(FormServerErrorCodes.DOWNLOAD_LIMIT_SELECTION);
      return;
    }

    // Validate that CSV/HTML downloads only include responses with a matched version
    // Note: DownloadDialog doesn't receive full submission metadata by default; validation
    // will be performed by the caller when available. If not available, the server may return an error.

    const filePrefix = slugify(`${formName}-${getDate()}`) + "-";

    // Exclude items without a version; only download responses that have a matched version
    const filteredIdsWithVersion = getFilteredIds(selectedVersionForDialog);

    if (
      filteredIdsWithVersion.length === 0 &&
      (selectedFormat === DownloadFormat.CSV || selectedFormat === DownloadFormat.HTML_ZIPPED)
    ) {
      setDownloadError("missing_version");
      setIsDownloading(false);
      return;
    }

    const selectedVersion = selectedVersionForDialog ?? dialogVersions[0] ?? null;
    try {
      await downloadResponses({
        formId,
        format: selectedFormat,
        language: i18n.language as Language,
        version: selectedVersion,
        filteredIds: filteredIdsWithVersion,
        filePrefix,
        shouldCreateZip: zipAllFiles || fileUploadEnabled,
        setDownloadProgress,
        setIsDownloading,
        onDownloadComplete: handleDownloadComplete,
        onClose: handleClose,
      });
    } catch (err) {
      logMessage.error(err as Error);
      setDownloadError((err as ServerActionError).code || true);
      setIsDownloading(false);
      setDownloadProgress(null);
      handleClose();
    }
  };

  const getDownloadProgressMessage = () => {
    if (!downloadProgress) return t("loading");

    switch (downloadProgress.phase) {
      case "responses":
        return t("downloadResponsesModals.downloadDialog.processingResponse", {
          response: downloadProgress.response,
          total: downloadProgress.total,
        });
      case "attachments":
        return (
          <>
            <span>
              {t("downloadResponsesModals.downloadDialog.responseProgress", {
                response: downloadProgress.response,
                total: downloadProgress.responseTotal,
              })}
            </span>
            <span aria-hidden="true" className="px-2">
              •
            </span>
            <span>
              {t("downloadResponsesModals.downloadDialog.downloadingAttachment", {
                current: Math.min(downloadProgress.completed + 1, downloadProgress.total),
                total: downloadProgress.total,
              })}
            </span>
          </>
        );
      case "recovery":
        return t("downloadResponsesModals.downloadDialog.preparingRecoveryCopy");
      case "zip":
        return t("downloadResponsesModals.downloadDialog.creatingZip", {
          percent: Math.floor(downloadProgress.percent),
        });
    }
  };

  return (
    <>
      {isDialogVisible && (
        <Dialog
          title={t("downloadResponsesModals.downloadDialog.title")}
          dialogRef={dialogRef}
          handleClose={handleClose}
        >
          <div className="p-4">
            <h3 className="mb-4 block font-semibold">
              {t("downloadResponsesModals.downloadDialog.chooseDownloadFormat")}
            </h3>
            <p className="">
              {t("downloadResponsesModals.downloadDialog.downloadFormatContext1")}
              <i>{t("downloadResponsesModals.downloadDialog.downloadFormatContext2")}</i>
              {t("downloadResponsesModals.downloadDialog.downloadFormatContext3")}
            </p>

            <div className="mt-4 flex flex-col gap-6">
              <VersionSelector
                dialogVersions={dialogVersions}
                selectedVersion={selectedVersionForDialog}
                setSelectedVersion={setSelectedVersionForDialog}
                t={t}
              />
              <div className="gc-input-radio">
                <input
                  type="radio"
                  name="downloadFormat"
                  id="zip"
                  value={DownloadFormat.HTML_ZIPPED}
                  checked={selectedFormat === DownloadFormat.HTML_ZIPPED}
                  className="gc-radio__input"
                  onChange={(e) => setSelectedFormat(e.target.value as DownloadFormat)}
                />
                <label htmlFor="zip" className="gc-radio-label">
                  <span className="radio-label-text">
                    <span className="block font-semibold">
                      {t("downloadResponsesModals.downloadDialog.html")}
                    </span>
                    <span className="font-normal">
                      {t("downloadResponsesModals.downloadDialog.htmlDescription")}
                    </span>
                  </span>
                </label>
              </div>

              <div className="gc-input-radio">
                <input
                  type="radio"
                  name="downloadFormat"
                  id="combined"
                  value={DownloadFormat.CSV}
                  checked={selectedFormat === DownloadFormat.CSV}
                  className="gc-radio__input"
                  onChange={(e) => setSelectedFormat(e.target.value as DownloadFormat)}
                />
                <label htmlFor="combined" className="gc-radio-label">
                  <span className="radio-label-text">
                    <span className="block font-semibold">
                      {t("downloadResponsesModals.downloadDialog.csv")}
                    </span>
                    <span className="font-normal">
                      {t("downloadResponsesModals.downloadDialog.csvDescription")}
                    </span>
                  </span>
                </label>
              </div>

              <div className="gc-input-radio">
                <input
                  type="radio"
                  name="downloadFormat"
                  id="json"
                  value={DownloadFormat.JSON}
                  checked={selectedFormat === DownloadFormat.JSON}
                  className="gc-radio__input"
                  onChange={(e) => setSelectedFormat(e.target.value as DownloadFormat)}
                />
                <label htmlFor="json" className="gc-radio-label">
                  <span className="radio-label-text">
                    <span className="block font-semibold">
                      {t("downloadResponsesModals.downloadDialog.json")}
                    </span>
                    <span className="font-normal">
                      {t("downloadResponsesModals.downloadDialog.jsonDescription")}
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {!fileUploadEnabled && (
              <div className="mt-6">
                <div className="gc-input-checkbox">
                  <input
                    type="checkbox"
                    name="downloadAllAsZip"
                    id="zipped"
                    checked={zipAllFiles}
                    disabled={selectedFormat === DownloadFormat.HTML_ZIPPED}
                    className="gc-input-checkbox__input"
                    onChange={() => setZipAllFiles(!zipAllFiles)}
                  />
                  <label htmlFor="zipped" className="gc-checkbox-label">
                    <span className="block font-semibold">
                      {t("downloadResponsesModals.downloadDialog.downloadAllAsZip")}
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="sticky bottom-0 flex flex-col gap-3 border-t-[0.5px] border-slate-500 bg-white p-4">
              {isDownloading && (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-2"
                  data-testid="download-progress-indicator"
                >
                  <SpinnerIcon className="size-6 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600" />
                  <span className="sr-only">{t("loading")}</span>
                  {fileUploadEnabled && (
                    <span className="text-sm">{getDownloadProgressMessage()}</span>
                  )}
                </div>
              )}
              <div className="flex gap-4">
                <Button theme="secondary" onClick={handleClose} disabled={isDownloading}>
                  {t("downloadResponsesModals.downloadDialog.cancel")}
                </Button>
                <Button
                  theme="primary"
                  onClick={handleDownload}
                  disabled={
                    !selectedFormat ||
                    isDownloading ||
                    (dialogVersions.length > 1 && !selectedVersionForDialog)
                  }
                >
                  {t("downloadResponsesModals.downloadDialog.download")}
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};
