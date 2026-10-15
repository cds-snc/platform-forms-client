"use client";
import React, { useEffect } from "react";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { logMessage } from "@lib/logger";
import {
  CSVResponse,
  DownloadFormat,
  HtmlZippedResponse,
  JSONResponse,
} from "@lib/responseDownloadFormats/types";
import JSZip from "jszip";
import { ga, getDate, slugify } from "@lib/client/clientHelpers";
import { SpinnerIcon } from "@serverComponents/icons/SpinnerIcon";
import { getSubmissionsByFormat } from "../../actions";
import { FormServerErrorCodes, Language, ServerActionError } from "@lib/types/form-builder-types";
import {
  addResponseAttachmentsToZip,
  type AttachmentDownloadProgress,
} from "@lib/responseDownloadFormats/attachments";
import { FeatureFlags } from "@lib/cache/types";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FormBuilderError } from "../../exceptions";
import { useTemplateVersioning } from "./useTemplateVersioning";
import { VersionSelector } from "./VersionSelector";

type DownloadProgress =
  | { phase: "responses"; response: number; total: number }
  | {
      phase: "attachments";
      response: number;
      responseTotal: number;
      completed: number;
      total: number;
    }
  | { phase: "recovery" }
  | { phase: "zip"; percent: number };

export const getVersionedZipFileName = (baseFileName: string, version: string | null) => {
  if (!version) return baseFileName;

  const normalizedVersion = version.trim().replace(/^v/i, "");
  return baseFileName.replace(/\.zip$/, `-v${normalizedVersion}.zip`);
};

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
}: {
  checkedItems: Map<string, boolean>;
  isDialogVisible: boolean;
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setDownloadError: React.Dispatch<React.SetStateAction<boolean | string>>;
  formId: string;
  formName: string;
  onSuccessfulDownload: (filteredIds: string[]) => void;
  responseDownloadLimit: number;
  checkedMeta?: { id?: string; name?: string; version?: string | number | null }[];
}) => {
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

  const handleDownloadComplete = (filteredIds: string[]) => {
    setIsDownloading(false);
    onSuccessfulDownload(filteredIds);
    handleClose();
  };

  const downloadFileFromBlob = (data: Blob, fileName: string) => {
    const href = window.URL.createObjectURL(data);
    const anchorElement = document.createElement("a");
    anchorElement.href = href;
    anchorElement.download = fileName;
    document.body.appendChild(anchorElement);
    anchorElement.click();
    document.body.removeChild(anchorElement);
    window.URL.revokeObjectURL(href);
  };

  const downloadFormatEvent = (
    formID: string,
    downloadType: DownloadFormat,
    numberOfRecords: number
  ) => {
    ga("download_format", {
      formID,
      downloadType,
      numberOfRecords,
    });
  };

  // Note: The API can provide additional formats, see DownloadFormat const and update this array if needed
  const availableFormats: DownloadFormat[] = [
    DownloadFormat.CSV,
    DownloadFormat.JSON,
    DownloadFormat.HTML_ZIPPED,
  ];

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(false);
    if (!selectedFormat || !availableFormats.includes(selectedFormat)) {
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

    let filteredIds = Array.from(checkedItems.keys());

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

    // If a version is selected in-dialog, narrow ids to that version; otherwise use all filtered ids
    filteredIds = filteredIdsWithVersion;

    const selectedVersion = selectedVersionForDialog ?? dialogVersions[0] ?? null;

    const downloadFailures: { responseId: string; filename?: string; reason: string }[] = [];

    // Keep a smaller response-only archive ready if generation of the full ZIP fails.
    const createRecoveryCopy = async (files: { path: string; data: string }[]) => {
      setDownloadProgress({ phase: "recovery" });
      try {
        const recoveryZip = new JSZip();
        files.forEach(({ path, data }) => recoveryZip.file(path, data));
        if (downloadFailures.length > 0) {
          recoveryZip.file(
            "response-download-errors.json",
            JSON.stringify(downloadFailures, null, 2)
          );
        }
        recoveryZip.file(
          "RECOVERY-COPY-NOTE.txt",
          "This recovery copy contains response files but may be missing attachments. The complete ZIP could not be created."
        );
        return await recoveryZip.generateAsync({ type: "blob", streamFiles: true });
      } catch (err) {
        logMessage.warn(
          `Response ZIP recovery copy could not be created for form ${formId}: ${(err as Error).message}`
        );
        return undefined;
      }
    };

    const generateDownloadZip = async (zip: JSZip, recoveryCopy?: Blob) => {
      const fileName = getVersionedZipFileName(
        `${filePrefix}responses-reponses.zip`,
        selectedVersion
      );

      try {
        setDownloadProgress({ phase: "zip", percent: 0 });
        const blob = await zip.generateAsync({ type: "blob", streamFiles: true }, ({ percent }) =>
          setDownloadProgress({ phase: "zip", percent })
        );
        logMessage.debug({
          message: "Response ZIP generation complete",
          formId,
          zipSizeBytes: blob.size,
        });
        downloadFileFromBlob(blob, fileName);
      } catch (err) {
        if (!recoveryCopy) throw err;
        logMessage.error(err as Error);
        logMessage.warn(`Downloading response ZIP recovery copy for form ${formId}`);
        downloadFileFromBlob(recoveryCopy, fileName);
      }

      // Only mark responses downloaded after output is ready, and leave failed items retryable.
      const successfulIds = filteredIds.filter(
        (responseId) => !downloadFailures.some((failure) => failure.responseId === responseId)
      );
      if (successfulIds.length > 0) {
        let trackingSucceeded = true;
        try {
          const trackingResponse = await getSubmissionsByFormat({
            formID: formId,
            ids: successfulIds,
            format: selectedFormat,
            lang: i18n.language as Language,
            version: selectedVersion,
            includeResponses: false,
            includeAttachments: false,
            includeCsvHeader: false,
            trackDownload: true,
          });
          if (
            typeof trackingResponse === "object" &&
            trackingResponse &&
            "error" in trackingResponse
          ) {
            trackingSucceeded = false;
            logMessage.warn(`Could not record response download for form ${formId}`);
          }
        } catch (err) {
          trackingSucceeded = false;
          logMessage.warn(
            `Could not record response download for form ${formId}: ${(err as Error).message}`
          );
        }
        if (trackingSucceeded) {
          handleDownloadComplete(successfulIds);
        } else {
          setIsDownloading(false);
          handleClose();
        }
      } else {
        setIsDownloading(false);
        handleClose();
      }
    };

    const refreshAttachmentDownloadLink = async (responseId: string, attachmentId: string) => {
      const refreshedResponse = await getSubmissionsByFormat({
        formID: formId,
        ids: [responseId],
        format: selectedFormat,
        lang: i18n.language as Language,
        version: selectedVersion,
        includeResponses: false,
        includeAttachments: true,
        includeCsvHeader: false,
        trackDownload: false,
      });

      if (
        typeof refreshedResponse !== "object" ||
        !refreshedResponse ||
        Array.isArray(refreshedResponse) ||
        "error" in refreshedResponse ||
        !("attachments" in refreshedResponse)
      ) {
        return undefined;
      }

      return refreshedResponse.attachments
        ?.find((group) => group.responseId === responseId)
        ?.attachments.find((attachment) => attachment.id === attachmentId)?.downloadLink;
    };

    const addAttachmentsToZip = (
      zip: JSZip,
      attachments: HtmlZippedResponse["attachments"],
      response: number
    ) =>
      addResponseAttachmentsToZip(zip, attachments, {
        onProgress: ({ completed, total }: AttachmentDownloadProgress) => {
          if (total > 0) {
            setDownloadProgress({
              phase: "attachments",
              response,
              responseTotal: filteredIds.length,
              completed,
              total,
            });
          }
        },
        refreshDownloadLink: refreshAttachmentDownloadLink,
        writeFailureManifest: false,
      });

    // Fetch each response just in time so its short-lived attachment links do not sit in a backlog.
    const processResponseQueue = async (
      processResponse: (responseId: string, index: number) => Promise<void>
    ) =>
      filteredIds.reduce(async (previous, responseId, index) => {
        await previous;
        setDownloadProgress({ phase: "responses", response: index + 1, total: filteredIds.length });
        try {
          await processResponse(responseId, index);
        } catch (err) {
          logMessage.error(err as Error);
          downloadFailures.push({
            responseId,
            reason: err instanceof Error ? err.message : "Response download failed",
          });
        }
      }, Promise.resolve());

    const finishZip = async (zip: JSZip, recoveryFiles: { path: string; data: string }[]) => {
      if (downloadFailures.length > 0) {
        zip.file("response-download-errors.json", JSON.stringify(downloadFailures, null, 2));
      }
      const recoveryCopy = await createRecoveryCopy(recoveryFiles);
      await generateDownloadZip(zip, recoveryCopy);
    };

    try {
      if (selectedFormat === DownloadFormat.HTML_ZIPPED) {
        const response = (await getSubmissionsByFormat({
          formID: formId,
          ids: filteredIds,
          format: DownloadFormat.HTML_ZIPPED,
          lang: i18n.language as Language,
          version: selectedVersion,
          includeResponses: false,
          includeAttachments: false,
          trackDownload: false,
        })) as HtmlZippedResponse | ServerActionError;

        if ("error" in response) {
          throw new FormBuilderError(response.error, response.code);
        }

        downloadFormatEvent(formId, selectedFormat, filteredIds.length);

        const zip = new JSZip();
        zip.file("_receipt-recu.html", response.receipt);
        const recoveryFiles = [{ path: "_receipt-recu.html", data: response.receipt }];

        await processResponseQueue(async (responseId, index) => {
          const queuedResponse = (await getSubmissionsByFormat({
            formID: formId,
            ids: [responseId],
            format: DownloadFormat.HTML_ZIPPED,
            lang: i18n.language as Language,
            version: selectedVersion,
            trackDownload: false,
          })) as HtmlZippedResponse | ServerActionError;

          if ("error" in queuedResponse) {
            throw new FormBuilderError(queuedResponse.error, queuedResponse.code);
          }

          queuedResponse.responses.forEach(({ id, html }) => {
            zip.file(`${id}.html`, html);
            recoveryFiles.push({ path: `${id}.html`, data: html });
          });
          downloadFailures.push(
            ...(await addAttachmentsToZip(zip, queuedResponse.attachments, index + 1))
          );
        });

        await finishZip(zip, recoveryFiles);
      }

      if (selectedFormat === DownloadFormat.CSV) {
        const universalBOMForUTF8 = "\uFEFF";
        if (zipAllFiles || fileUploadEnabled) {
          const response = (await getSubmissionsByFormat({
            formID: formId,
            ids: filteredIds,
            format: DownloadFormat.CSV,
            lang: i18n.language as Language,
            version: selectedVersion,
            includeResponses: false,
            includeAttachments: false,
            trackDownload: false,
          })) as CSVResponse | ServerActionError;

          if ("error" in response) {
            throw new FormBuilderError(response.error, response.code);
          }

          downloadFormatEvent(formId, selectedFormat, filteredIds.length);
          const zip = new JSZip();
          zip.file("receipt-recu.html", response.receipt);
          let csvResponses = response.responses;
          await processResponseQueue(async (responseId, index) => {
            const queuedResponse = (await getSubmissionsByFormat({
              formID: formId,
              ids: [responseId],
              format: DownloadFormat.CSV,
              lang: i18n.language as Language,
              version: selectedVersion,
              includeCsvHeader: false,
              trackDownload: false,
            })) as CSVResponse | ServerActionError;

            if ("error" in queuedResponse) {
              throw new FormBuilderError(queuedResponse.error, queuedResponse.code);
            }

            csvResponses += queuedResponse.responses;
            downloadFailures.push(
              ...(await addAttachmentsToZip(zip, queuedResponse.attachments, index + 1))
            );
          });

          zip.file("responses-reponses.csv", universalBOMForUTF8 + csvResponses);
          await finishZip(zip, [
            { path: "receipt-recu.html", data: response.receipt },
            { path: "responses-reponses.csv", data: universalBOMForUTF8 + csvResponses },
          ]);
        } else {
          const response = (await getSubmissionsByFormat({
            formID: formId,
            ids: filteredIds,
            format: DownloadFormat.CSV,
            lang: i18n.language as Language,
            version: selectedVersion,
          })) as CSVResponse | ServerActionError;

          if ("error" in response) {
            throw new FormBuilderError(response.error, response.code);
          }

          downloadFormatEvent(formId, selectedFormat, filteredIds.length);
          downloadFileFromBlob(new Blob([response.receipt]), `${filePrefix}receipt-recu.html`);
          downloadFileFromBlob(
            new Blob([universalBOMForUTF8 + response.responses]),
            `${filePrefix}responses-reponses.csv`
          );
          handleDownloadComplete(filteredIds);
        }
      }

      if (selectedFormat === DownloadFormat.JSON) {
        if (zipAllFiles || fileUploadEnabled) {
          const response = (await getSubmissionsByFormat({
            formID: formId,
            ids: filteredIds,
            format: DownloadFormat.JSON,
            lang: i18n.language as Language,
            version: selectedVersion,
            includeResponses: false,
            includeAttachments: false,
            trackDownload: false,
          })) as JSONResponse | ServerActionError;

          if ("error" in response) {
            throw new FormBuilderError(response.error, response.code);
          }

          downloadFormatEvent(formId, selectedFormat, filteredIds.length);
          const zip = new JSZip();
          zip.file("receipt-recu.html", response.receipt);
          const jsonResponses: object[] = [];
          await processResponseQueue(async (responseId, index) => {
            const queuedResponse = (await getSubmissionsByFormat({
              formID: formId,
              ids: [responseId],
              format: DownloadFormat.JSON,
              lang: i18n.language as Language,
              version: selectedVersion,
              trackDownload: false,
            })) as JSONResponse | ServerActionError;

            if ("error" in queuedResponse) {
              throw new FormBuilderError(queuedResponse.error, queuedResponse.code);
            }

            if (Array.isArray(queuedResponse.responses)) {
              jsonResponses.push(...queuedResponse.responses);
            }
            downloadFailures.push(
              ...(await addAttachmentsToZip(zip, queuedResponse.attachments, index + 1))
            );
          });

          const jsonData = JSON.stringify(jsonResponses);
          zip.file("responses-reponses.json", jsonData);
          await finishZip(zip, [
            { path: "receipt-recu.html", data: response.receipt },
            { path: "responses-reponses.json", data: jsonData },
          ]);
        } else {
          const response = (await getSubmissionsByFormat({
            formID: formId,
            ids: filteredIds,
            format: DownloadFormat.JSON,
            lang: i18n.language as Language,
            version: selectedVersion,
          })) as JSONResponse | ServerActionError;

          if ("error" in response) {
            throw new FormBuilderError(response.error, response.code);
          }

          downloadFormatEvent(formId, selectedFormat, filteredIds.length);
          downloadFileFromBlob(new Blob([response.receipt]), `${filePrefix}receipt-recu.html`);
          downloadFileFromBlob(
            new Blob([JSON.stringify(response.responses)], { type: "application/json" }),
            `${filePrefix}responses-reponses.json`
          );
          handleDownloadComplete(filteredIds);
        }
      }
    } catch (err) {
      logMessage.error(err as Error);
      setDownloadError((err as ServerActionError).code || true);
      setIsDownloading(false);
      setDownloadProgress(null);
      handleClose();
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
                <div role="status" aria-live="polite" className="flex items-center gap-2">
                  <SpinnerIcon className="size-6 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600" />
                  <span className="text-sm">
                    {downloadProgress?.phase === "responses" ? (
                      t("downloadResponsesModals.downloadDialog.processingResponse", {
                        response: downloadProgress.response,
                        total: downloadProgress.total,
                      })
                    ) : downloadProgress?.phase === "attachments" ? (
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
                            current: Math.min(
                              downloadProgress.completed + 1,
                              downloadProgress.total
                            ),
                            total: downloadProgress.total,
                          })}
                        </span>
                      </>
                    ) : downloadProgress?.phase === "recovery" ? (
                      t("downloadResponsesModals.downloadDialog.preparingRecoveryCopy")
                    ) : downloadProgress?.phase === "zip" ? (
                      t("downloadResponsesModals.downloadDialog.creatingZip", {
                        percent: Math.floor(downloadProgress.percent),
                      })
                    ) : (
                      t("loading")
                    )}
                  </span>
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
