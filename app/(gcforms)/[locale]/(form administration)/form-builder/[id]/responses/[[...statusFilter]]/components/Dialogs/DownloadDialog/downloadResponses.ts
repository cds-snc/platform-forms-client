/*--------------------------------------------*
 * Framework and Third-Party
 *--------------------------------------------*/
import JSZip from "jszip";

/*--------------------------------------------*
 * Internal Aliases
 *--------------------------------------------*/
import { ga } from "@lib/client/clientHelpers";
import {
  addResponseAttachmentsToZip,
  type AttachmentDownloadProgress,
} from "@lib/responseDownloadFormats/attachments";
import { processSequentially } from "@lib/responseDownloadFormats/processSequentially";
import {
  DownloadFormat,
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
import {
  createRecoveryCopy,
  downloadFileFromBlob,
  generateDownloadZip,
  getVersionedZipFileName,
} from "./downloadZip";
import { createAttachmentDownloadLinkRefresher } from "./refreshAttachmentDownloadLink";
import type {
  ArchiveAdapter,
  DownloadFailure,
  DownloadResponsesOptions,
  RecoveryFile,
  SimpleResponse,
} from "./DownloadDialog.types";

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
  setDownloadProgress,
  setIsDownloading,
  onDownloadComplete,
  onClose,
}: DownloadResponsesOptions) => {
  // Responses are only fetched one at a time when attachments are involved. If the check fails
  // (undefined), fall back to the sequential path since it handles every case.
  const templateHasFileInput = (await getTemplateHasFileInput({ formID: formId, version })) ?? true;

  const downloadFailures: DownloadFailure[] = [];

  const finishZipDownload = async (zip: JSZip, recoveryCopy?: Blob) => {
    const fileName = getVersionedZipFileName(`${filePrefix}responses-reponses.zip`, version);
    const usedRecoveryCopy = await generateDownloadZip({
      zip,
      recoveryCopy,
      fileName,
      formId,
      setDownloadProgress,
    });
    const hasDownloadFailures = downloadFailures.length > 0 || usedRecoveryCopy;

    const fullyDownloadedResponseIds = usedRecoveryCopy
      ? []
      : filteredIds.filter(
          (responseId) => !downloadFailures.some((failure) => failure.responseId === responseId)
        );
    if (fullyDownloadedResponseIds.length === 0) {
      if (hasDownloadFailures) {
        onDownloadComplete([], true);
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
      onDownloadComplete(fullyDownloadedResponseIds, hasDownloadFailures);
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
    response: number
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
    });
    downloadFailures.push(...failures);
  };

  // Process responses one at a time so short-lived attachment links are still valid when used.
  const processResponseQueue = async (
    processResponse: (responseId: string, index: number) => Promise<void>
  ) =>
    processSequentially(filteredIds, async (responseId, index) => {
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
    });

  const finishZip = async (zip: JSZip, recoveryFiles: RecoveryFile[]) => {
    if (downloadFailures.length > 0) {
      zip.file("response-download-errors.json", JSON.stringify(downloadFailures, null, 2));
    }
    const recoveryCopy = await createRecoveryCopy(
      recoveryFiles,
      downloadFailures,
      formId,
      setDownloadProgress
    );
    await finishZipDownload(zip, recoveryCopy);
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
    await generateDownloadZip({ zip, fileName, formId, setDownloadProgress });
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
    zip.file("receipt-recu.html", response.receipt);
    let content = adapter.initialize(response);

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

      content = adapter.append(content, queuedResponse);
      await addAttachmentsToZipAndRecordFailures(zip, queuedResponse.attachments, index + 1);
    });

    const serializedContent = adapter.serialize(content);
    zip.file(adapter.responseFileName, serializedContent);
    await finishZip(zip, [
      { path: "receipt-recu.html", data: response.receipt },
      { path: adapter.responseFileName, data: serializedContent },
    ]);
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
    zip.file("_receipt-recu.html", response.receipt);
    const recoveryFiles = [{ path: "_receipt-recu.html", data: response.receipt }];

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

      queuedResponse.responses.forEach(({ id, html }) => {
        zip.file(`${id}.html`, html);
        recoveryFiles.push({ path: `${id}.html`, data: html });
      });
      await addAttachmentsToZipAndRecordFailures(zip, queuedResponse.attachments, index + 1);
    });

    await finishZip(zip, recoveryFiles);
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
