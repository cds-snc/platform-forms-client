/*--------------------------------------------*
 * Framework and Third-Party
 *--------------------------------------------*/
import JSZip from "jszip";

/*--------------------------------------------*
 * Internal Aliases
 *--------------------------------------------*/
import { ga } from "@lib/client/clientHelpers";
import {
  RESPONSES_UI_ZIP_ENTRY_OVERHEAD_BYTES,
  RESPONSES_UI_ZIP_MANIFEST_RESERVE_BYTES,
} from "@root/constants";
import {
  addResponseAttachmentsToZip,
  type AttachmentDownloadProgress,
} from "@lib/responseDownloadFormats/attachments";
import { processSequentially } from "@lib/responseDownloadFormats/processSequentially";
import {
  DownloadFormat,
  ResponseDownloadErrorCode,
  type CSVResponse,
  type HtmlZippedResponse,
  type JSONResponse,
} from "@lib/responseDownloadFormats/types";
import { logMessage } from "@lib/logger";
import { FormServerErrorCodes, type ServerActionError } from "@lib/types/form-builder-types";

/*--------------------------------------------*
 * Local Relative
 *--------------------------------------------*/
import { getSubmissionsByFormat, getTemplateHasFileInput } from "../../../actions";
import { FormBuilderError } from "../../../exceptions";
import {
  createIndividualResponseFiles,
  csvArchiveAdapter,
  jsonArchiveAdapter,
} from "./downloadResponseFiles";
import { downloadFileFromBlob, generateDownloadZip, getVersionedZipFileName } from "./downloadZip";
import { createAttachmentDownloadLinkRefresher } from "./refreshAttachmentDownloadLink";
import type {
  ArchiveAdapter,
  DownloadFailure,
  DownloadResponsesOptions,
  SimpleResponse,
} from "./DownloadDialog.types";

type ZipEntryData = string | Blob | Uint8Array | ArrayBuffer;

const estimateZipEntrySize = (path: string, data: ZipEntryData) => {
  const dataSize =
    typeof data === "string"
      ? new TextEncoder().encode(data).byteLength
      : data instanceof Blob
        ? data.size
        : data.byteLength;
  return (
    dataSize + new TextEncoder().encode(path).byteLength * 8 + RESPONSES_UI_ZIP_ENTRY_OVERHEAD_BYTES
  );
};

const trackDownloadFormat = (formId: string, format: DownloadFormat, numberOfRecords: number) => {
  ga("download_format", {
    formID: formId,
    downloadType: format,
    numberOfRecords,
  });
};

const throwOnServerActionError: <Response extends object>(
  response: Response | ServerActionError
) => asserts response is Response = (response) => {
  if ("error" in response) throw new FormBuilderError(response.error, response.code);
};

export const downloadResponses = async ({
  formId,
  format,
  language,
  version,
  filteredIds,
  filePrefix,
  shouldCreateZip,
  responsesDownloadZipMaxSizeMB,
  setDownloadProgress,
  setIsDownloading,
  onDownloadComplete,
  onClose,
}: DownloadResponsesOptions) => {
  // Responses are only fetched one at a time when attachments are involved. If the check fails
  // (undefined), fall back to the sequential path since it handles every case.
  const templateHasFileInput = (await getTemplateHasFileInput({ formID: formId, version })) ?? true;

  const downloadFailures: DownloadFailure[] = [];
  const zipEntrySizes = new Map<string, number>();
  const responsesDownloadZipMaxSizeBytes = responsesDownloadZipMaxSizeMB * 1024 * 1024;
  let zipSizeBytes = 0;
  let zipSizeLimitReached = false;
  let hasCommittedResponse = false;

  // The limit is only enforced once at least a single response is in the ZIP this is to avoid blocking the download of responses completely.
  const exceedsZipSizeLimit = (sizeBytes: number) =>
    hasCommittedResponse &&
    sizeBytes > responsesDownloadZipMaxSizeBytes - RESPONSES_UI_ZIP_MANIFEST_RESERVE_BYTES;

  const reserveZipFile = (
    path: string,
    data: ZipEntryData,
    { enforceLimit = true }: { enforceLimit?: boolean } = {}
  ) => {
    const entrySize = estimateZipEntrySize(path, data);
    const nextSize = zipSizeBytes - (zipEntrySizes.get(path) ?? 0) + entrySize;
    if (enforceLimit && exceedsZipSizeLimit(nextSize)) {
      zipSizeLimitReached = true;
      return false;
    }

    zipEntrySizes.set(path, entrySize);
    zipSizeBytes = nextSize;
    return true;
  };

  const addZipFile = (
    zip: JSZip,
    path: string,
    data: ZipEntryData,
    options?: { enforceLimit?: boolean }
  ) => {
    if (!reserveZipFile(path, data, options)) return false;
    zip.file(path, data);
    return true;
  };

  const removeZipFileReservation = (path: string) => {
    zipSizeBytes -= zipEntrySizes.get(path) ?? 0;
    zipEntrySizes.delete(path);
  };

  const createStagedZipFiles = () => {
    const files = new Map<string, ZipEntryData>();
    const entrySizes = new Map<string, number>();
    let stagedSizeBytes = 0;

    return {
      add: (path: string, data: ZipEntryData) => {
        const entrySize = estimateZipEntrySize(path, data);
        const previousSize = entrySizes.get(path) ?? zipEntrySizes.get(path) ?? 0;
        const nextStagedSizeBytes = stagedSizeBytes - previousSize + entrySize;
        const nextSize = zipSizeBytes + nextStagedSizeBytes;
        if (exceedsZipSizeLimit(nextSize)) {
          zipSizeLimitReached = true;
          return false;
        }

        files.set(path, data);
        entrySizes.set(path, entrySize);
        stagedSizeBytes = nextStagedSizeBytes;
        return true;
      },
      // Sizes were already checked while staging, so commit without re-checking the limit.
      commit: (zip: JSZip) => {
        files.forEach((data, path) => addZipFile(zip, path, data, { enforceLimit: false }));
        hasCommittedResponse = true;
        if (
          zipSizeBytes >
          responsesDownloadZipMaxSizeBytes - RESPONSES_UI_ZIP_MANIFEST_RESERVE_BYTES
        ) {
          zipSizeLimitReached = true;
        }
      },
    };
  };

  const finishZipDownload = async (zip: JSZip) => {
    const fileName = getVersionedZipFileName(`${filePrefix}responses-reponses.zip`, version);
    await generateDownloadZip({
      zip,
      fileName,
      setDownloadProgress,
    });
    const hasDownloadFailures = downloadFailures.length > 0;
    const warnings = {
      sizeLimitReached: downloadFailures.some(
        (failure) => failure.code === ResponseDownloadErrorCode.SIZE_LIMIT
      ),
      processingFailed: downloadFailures.some(
        (failure) => failure.code === ResponseDownloadErrorCode.PROCESSING
      ),
    };

    const fullyDownloadedResponseIds = filteredIds.filter(
      (responseId) => !downloadFailures.some((failure) => failure.responseId === responseId)
    );
    if (fullyDownloadedResponseIds.length === 0) {
      if (hasDownloadFailures) {
        onDownloadComplete([], warnings);
        return;
      }
      setIsDownloading(false);
      onClose();
      return;
    }

    let trackingSucceeded = true;
    try {
      const trackingResponse = await getSubmissionsByFormat({
        formID: formId,
        ids: fullyDownloadedResponseIds,
        format,
        lang: language,
        version,
        includeResponses: false,
        includeAttachments: false,
        includeCsvHeader: false,
        trackDownload: true,
      });
      if (typeof trackingResponse === "object" && trackingResponse && "error" in trackingResponse) {
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
      onDownloadComplete(fullyDownloadedResponseIds, warnings);
      return;
    }

    setIsDownloading(false);
    onClose();
  };

  const refreshAttachmentDownloadLink = createAttachmentDownloadLinkRefresher({
    formId,
    format,
    language,
    version,
  });

  const addAttachmentsToZipAndRecordFailures = async (
    zip: JSZip,
    attachments: HtmlZippedResponse["attachments"],
    response: number,
    addFileToZip: (path: string, data: ZipEntryData) => boolean
  ) => {
    const failures = await addResponseAttachmentsToZip(zip, attachments, {
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
      addFileToZip,
    });
    return failures;
  };

  // Process responses one at a time so short-lived attachment links are still valid when used.
  const processResponseQueue = async (
    processResponse: (responseId: string, index: number) => Promise<void>
  ) =>
    processSequentially(filteredIds, async (responseId, index) => {
      setDownloadProgress({ phase: "responses", response: index + 1, total: filteredIds.length });
      if (zipSizeLimitReached) {
        downloadFailures.push({
          code: ResponseDownloadErrorCode.SIZE_LIMIT,
          responseId,
          reason: "At download limit",
        });
        return;
      }

      try {
        await processResponse(responseId, index);
      } catch (err) {
        logMessage.error(err as Error);
        downloadFailures.push({
          code: ResponseDownloadErrorCode.PROCESSING,
          responseId,
          reason: err instanceof Error ? err.message : "Response download failed",
        });
      }
    });

  const finishZip = async (zip: JSZip, receiptPath: string, initialReceipt: string) => {
    const successfulResponseIds = filteredIds.filter(
      (responseId) => !downloadFailures.some((failure) => failure.responseId === responseId)
    );

    if (successfulResponseIds.length === 0) {
      removeZipFileReservation(receiptPath);
    } else {
      let receipt = initialReceipt;
      let receiptRegenerationFailed = false;
      if (downloadFailures.length > 0) {
        try {
          const receiptResponse = (await getSubmissionsByFormat({
            formID: formId,
            ids: successfulResponseIds,
            format,
            lang: language,
            version,
            includeResponses: false,
            includeAttachments: false,
            includeCsvHeader: false,
            trackDownload: false,
          })) as SimpleResponse | HtmlZippedResponse | ServerActionError;
          throwOnServerActionError(receiptResponse);
          receipt = receiptResponse.receipt;
        } catch (err) {
          receiptRegenerationFailed = true;
          logMessage.error(err as Error);
          downloadFailures.push(
            ...successfulResponseIds.map((responseId) => ({
              code: ResponseDownloadErrorCode.PROCESSING,
              responseId,
              reason: "Response receipt could not be regenerated",
            }))
          );
          removeZipFileReservation(receiptPath);
          const recoveryNote =
            "The response receipt could not be regenerated. These response files are included, but their submissions were not marked as downloaded.";
          zip.file("RECOVERY-COPY-NOTE.txt", recoveryNote);
        }
      }

      // The receipt was reserved before any responses were added, so it is always included.
      if (!receiptRegenerationFailed) {
        addZipFile(zip, receiptPath, receipt, { enforceLimit: false });
      }
    }

    if (downloadFailures.length > 0) {
      zip.file("errors-erreurs.json", JSON.stringify(downloadFailures, null, 2));
    }
    await finishZipDownload(zip);
  };

  const downloadIndividualFiles = async (
    individualFormat: typeof DownloadFormat.CSV | typeof DownloadFormat.JSON
  ) => {
    const response = (await getSubmissionsByFormat({
      formID: formId,
      ids: filteredIds,
      format: individualFormat,
      lang: language,
      version,
    })) as CSVResponse | JSONResponse | ServerActionError;

    throwOnServerActionError(response);

    trackDownloadFormat(formId, individualFormat, filteredIds.length);
    createIndividualResponseFiles(individualFormat, response, filePrefix).forEach(
      ({ name, content, contentType }) =>
        downloadFileFromBlob(
          new Blob([content], contentType ? { type: contentType } : undefined),
          name
        )
    );
    onDownloadComplete(filteredIds);
  };

  // Without file inputs there are no short-lived attachment links, so fetch everything at once.
  const fetchAllResponsesAtOnce = async <Response extends object>(
    responseFormat: DownloadFormat
  ): Promise<Response> => {
    setDownloadProgress({ phase: "responses", response: 0, total: filteredIds.length });
    const response = (await getSubmissionsByFormat({
      formID: formId,
      ids: filteredIds,
      format: responseFormat,
      lang: language,
      version,
      includeAttachments: false,
      trackDownload: true,
    })) as Response | ServerActionError;

    throwOnServerActionError(response);

    setDownloadProgress({
      phase: "responses",
      response: filteredIds.length,
      total: filteredIds.length,
    });
    trackDownloadFormat(formId, responseFormat, filteredIds.length);
    return response;
  };

  const finishSingleRequestZip = async (zip: JSZip) => {
    const fileName = getVersionedZipFileName(`${filePrefix}responses-reponses.zip`, version);
    await generateDownloadZip({ zip, fileName, setDownloadProgress });
    onDownloadComplete(filteredIds);
  };

  const downloadSimpleFormatArchive = async <T>(
    archiveFormat: typeof DownloadFormat.CSV | typeof DownloadFormat.JSON,
    adapter: ArchiveAdapter<T>
  ) => {
    if (!templateHasFileInput) {
      const allResponses = await fetchAllResponsesAtOnce<SimpleResponse>(archiveFormat);
      const zip = new JSZip();
      createIndividualResponseFiles(archiveFormat, allResponses, "").forEach(({ name, content }) =>
        zip.file(name, content)
      );
      await finishSingleRequestZip(zip);
      return;
    }

    const response = (await getSubmissionsByFormat({
      formID: formId,
      ids: filteredIds,
      format: archiveFormat,
      lang: language,
      version,
      includeResponses: false,
      includeAttachments: false,
      trackDownload: false,
    })) as SimpleResponse | ServerActionError;

    throwOnServerActionError(response);

    trackDownloadFormat(formId, archiveFormat, filteredIds.length);
    const zip = new JSZip();
    reserveZipFile("receipt-recu.html", response.receipt);
    let content = adapter.initialize(response);
    addZipFile(zip, adapter.responseFileName, adapter.serialize(content));

    await processResponseQueue(async (responseId, index) => {
      const queuedResponse = (await getSubmissionsByFormat({
        formID: formId,
        ids: [responseId],
        format: archiveFormat,
        lang: language,
        version,
        ...(archiveFormat === DownloadFormat.CSV && { includeCsvHeader: false }),
        trackDownload: false,
      })) as SimpleResponse | ServerActionError;

      throwOnServerActionError(queuedResponse);

      const stagedFiles = createStagedZipFiles();
      const nextContent = adapter.append(content, queuedResponse);
      if (!stagedFiles.add(adapter.responseFileName, adapter.serialize(nextContent))) {
        downloadFailures.push({
          code: ResponseDownloadErrorCode.SIZE_LIMIT,
          responseId,
          reason: "At download limit",
        });
        return;
      }
      const attachmentFailures = await addAttachmentsToZipAndRecordFailures(
        zip,
        queuedResponse.attachments,
        index + 1,
        stagedFiles.add
      );
      if (attachmentFailures.length > 0) {
        downloadFailures.push(...attachmentFailures);
        return;
      }
      stagedFiles.commit(zip);
      content = nextContent;
    });

    await finishZip(zip, "receipt-recu.html", response.receipt);
  };

  const downloadHtmlArchive = async () => {
    if (!templateHasFileInput) {
      const allResponses = await fetchAllResponsesAtOnce<HtmlZippedResponse>(
        DownloadFormat.HTML_ZIPPED
      );
      const zip = new JSZip();
      zip.file("_receipt-recu.html", allResponses.receipt);
      allResponses.responses.forEach(({ id, html }) => zip.file(`${id}.html`, html));
      await finishSingleRequestZip(zip);
      return;
    }

    const response = (await getSubmissionsByFormat({
      formID: formId,
      ids: filteredIds,
      format: DownloadFormat.HTML_ZIPPED,
      lang: language,
      version,
      includeResponses: false,
      includeAttachments: false,
      trackDownload: false,
    })) as HtmlZippedResponse | ServerActionError;

    throwOnServerActionError(response);

    trackDownloadFormat(formId, DownloadFormat.HTML_ZIPPED, filteredIds.length);
    const zip = new JSZip();
    reserveZipFile("_receipt-recu.html", response.receipt);

    await processResponseQueue(async (responseId, index) => {
      const queuedResponse = (await getSubmissionsByFormat({
        formID: formId,
        ids: [responseId],
        format: DownloadFormat.HTML_ZIPPED,
        lang: language,
        version,
        trackDownload: false,
      })) as HtmlZippedResponse | ServerActionError;

      throwOnServerActionError(queuedResponse);

      const stagedFiles = createStagedZipFiles();
      let responseFileFailed = false;
      queuedResponse.responses.forEach(({ id, html }) => {
        if (!stagedFiles.add(`${id}.html`, html)) {
          responseFileFailed = true;
          downloadFailures.push({
            code: ResponseDownloadErrorCode.SIZE_LIMIT,
            responseId,
            filename: `${id}.html`,
            reason: "At download limit",
          });
        }
      });
      if (responseFileFailed) return;
      const attachmentFailures = await addAttachmentsToZipAndRecordFailures(
        zip,
        queuedResponse.attachments,
        index + 1,
        stagedFiles.add
      );
      if (attachmentFailures.length > 0) {
        downloadFailures.push(...attachmentFailures);
        return;
      }
      stagedFiles.commit(zip);
    });

    await finishZip(zip, "_receipt-recu.html", response.receipt);
  };

  const downloadHandlers: Partial<Record<DownloadFormat, () => Promise<void>>> = {
    [DownloadFormat.HTML_ZIPPED]: downloadHtmlArchive,
    [DownloadFormat.CSV]: () =>
      shouldCreateZip
        ? downloadSimpleFormatArchive(DownloadFormat.CSV, csvArchiveAdapter)
        : downloadIndividualFiles(DownloadFormat.CSV),
    [DownloadFormat.JSON]: () =>
      shouldCreateZip
        ? downloadSimpleFormatArchive(DownloadFormat.JSON, jsonArchiveAdapter)
        : downloadIndividualFiles(DownloadFormat.JSON),
  };

  const downloadHandler = downloadHandlers[format];
  if (!downloadHandler) {
    throw new FormBuilderError(
      "Invalid download format",
      FormServerErrorCodes.DOWNLOAD_INVALID_FORMAT
    );
  }

  await downloadHandler();
};
