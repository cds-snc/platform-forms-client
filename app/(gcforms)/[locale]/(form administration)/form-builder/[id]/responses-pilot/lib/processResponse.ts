import type { FileSystemDirectoryHandle, FileSystemFileHandle } from "native-file-system-adapter";
import { CompleteAttachment, FormSubmission } from "./types";
import { decryptFormSubmission } from "./utils";
import {
  ATTACHMENTS_FOLDER,
  MALICIOUS_ATTACHMENTS_FOLDER,
  MAPPING_FILENAME,
  RAW_RESPONSE_FOLDER,
  SOURCE_FOLDER,
} from "./constants";
import { FormProperties } from "@root/lib/types";
import { GCFormsApiClient } from "./apiClient";
import { writeHtml } from "./htmlWriter";
import { writeRow } from "./csvWriter";
import { TFunction } from "i18next";
import { md5 } from "hash-wasm";
import { withRetry } from "@root/lib/utils/retry";
import { logDownloadOperation, ResponseDownloadLogger } from "./logger";

export const processResponse = async ({
  incrementProcessedSubmissionsCount,
  setHasMaliciousAttachments,
  workingDirectoryHandle,
  htmlDirectoryHandle,
  csvFileHandle,
  apiClient,
  decryptionKey,
  responseName,
  selectedFormat,
  formId,
  formTemplate,
  versionNumber,
  t,
  logger,
}: {
  incrementProcessedSubmissionsCount: () => void;
  setHasMaliciousAttachments: React.Dispatch<React.SetStateAction<boolean>>;
  workingDirectoryHandle: FileSystemDirectoryHandle;
  htmlDirectoryHandle: FileSystemDirectoryHandle | null;
  csvFileHandle: FileSystemFileHandle | null;
  apiClient: GCFormsApiClient;
  decryptionKey: CryptoKey;
  responseName: string;
  selectedFormat: string;
  formId: string;
  formTemplate: FormProperties;
  versionNumber?: number | null;
  t: TFunction<string | string[], undefined>;
  logger: ResponseDownloadLogger;
}) => {
  const startedAt = Date.now();
  logger.info("Processing submission", { submissionId: responseName, format: selectedFormat });
  const run = <T>(operation: string, path: string, action: () => Promise<T>) =>
    logDownloadOperation(logger, { submissionId: responseName, operation, path }, action);

  const confirmedResponse = await run("download and confirm submission", SOURCE_FOLDER, () =>
    downloadAndConfirmResponse({
      workingDirectoryHandle,
      apiClient,
      decryptionKey,
      responseName: responseName,
      logger,
    })
  );

  if (confirmedResponse.attachments && confirmedResponse.attachments.size > 0) {
    if (
      Array.from(confirmedResponse.attachments.values()).some((att) => att.isPotentiallyMalicious)
    ) {
      setHasMaliciousAttachments(true);
    }

    const attachmentsDirectory = await run("get attachments directory", ATTACHMENTS_FOLDER, () =>
      workingDirectoryHandle.getDirectoryHandle(ATTACHMENTS_FOLDER, { create: true })
    );
    const attachmentPath = `${ATTACHMENTS_FOLDER}/${responseName}`;
    const responseAttachmentsDirectory = await run(
      "get submission attachments directory",
      attachmentPath,
      () => attachmentsDirectory.getDirectoryHandle(responseName, { create: true })
    );

    // Write a mapping file for attachments
    const mappingPath = `${attachmentPath}/${MAPPING_FILENAME}`;
    const mappingFileHandle = await run("open attachment mapping file", mappingPath, () =>
      responseAttachmentsDirectory.getFileHandle(MAPPING_FILENAME, { create: true })
    );
    const mappingFileStream = await run("create attachment mapping writable", mappingPath, () =>
      mappingFileHandle.createWritable({ keepExistingData: false })
    );
    await run("write attachment mapping", mappingPath, () =>
      mappingFileStream.write(
        JSON.stringify(Object.fromEntries(confirmedResponse.attachments), null, 2)
      )
    );
    await run("close attachment mapping writable", mappingPath, () => mappingFileStream.close());
  }

  switch (selectedFormat) {
    case "html":
      if (!htmlDirectoryHandle) {
        throw new Error("HTML directory handle is null");
      }

      await run("write HTML response", `${htmlDirectoryHandle.name}/${responseName}.html`, () =>
        writeHtml({
          htmlDirectoryHandle,
          formTemplate,
          submission: confirmedResponse,
          attachments: confirmedResponse.attachments,
          formId,
          versionNumber,
          t,
        })
      );
      break;
    default:
      if (!csvFileHandle) {
        throw new Error("CSV file handle is null");
      }

      await run("append CSV row", csvFileHandle.name, () =>
        writeRow({
          submissionId: confirmedResponse.submissionId,
          createdAt: confirmedResponse.createdAt,
          formTemplate,
          csvFileHandle,
          rawAnswers: confirmedResponse.rawAnswers,
          attachments: confirmedResponse.attachments,
          logger,
        })
      );
      break;
  }

  incrementProcessedSubmissionsCount();
  logger.info("Submission processing completed", {
    submissionId: responseName,
    format: selectedFormat,
    attachmentCount: confirmedResponse.attachments.size,
    durationMs: Date.now() - startedAt,
  });
};

export type ResponseFilenameMapping = Map<
  string,
  { originalName: string; actualName: string; isPotentiallyMalicious: boolean }
>;

export type AttachmentDownloadResult = {
  id: string;
  originalName: string;
  actualName: string;
  isPotentiallyMalicious: boolean;
};

const downloadAndConfirmResponse = async ({
  workingDirectoryHandle,
  apiClient,
  decryptionKey,
  responseName,
  logger,
}: {
  workingDirectoryHandle: FileSystemDirectoryHandle;
  apiClient: GCFormsApiClient;
  decryptionKey: CryptoKey;
  responseName: string;
  logger: ResponseDownloadLogger;
}) => {
  const run = <T>(operation: string, path: string, action: () => Promise<T>) =>
    logDownloadOperation(logger, { submissionId: responseName, operation, path }, action);
  const rawDirectoryPath = `${SOURCE_FOLDER}/${RAW_RESPONSE_FOLDER}`;
  const rawFilePath = `${rawDirectoryPath}/${responseName}.json`;
  // Get or create source directory, then raw data directory within it
  const sourceDirectoryHandle: FileSystemDirectoryHandle = await run(
    "get source directory",
    SOURCE_FOLDER,
    () => workingDirectoryHandle.getDirectoryHandle(SOURCE_FOLDER, { create: true })
  );

  const dataDirectoryHandle: FileSystemDirectoryHandle = await run(
    "get raw response directory",
    rawDirectoryPath,
    () => sourceDirectoryHandle.getDirectoryHandle(RAW_RESPONSE_FOLDER, { create: true })
  );

  // Retrieve encrypted response from API
  const encryptedSubmission = await withRetry(() => apiClient.getFormSubmission(responseName), {
    maxRetries: 6,
    onRetry: (attempt, error) => {
      const cause = error instanceof Error && error.cause ? error.cause : null;
      logger.warn(`Attempt ${attempt} to download submission ${responseName} failed: ${error}`, {
        cause,
      });
    },
    onFinalFailure: async (error, totalAttempts) => {
      const cause = error instanceof Error && error.cause ? error.cause : null;
      logger.error(
        `Failed to download submission ${responseName} after ${totalAttempts} attempts: ${error}`,
        { cause }
      );
    },
    isRetryable: (error) => {
      const err = error as { response?: { status?: number } };
      // Retry on network errors or 5xx server errors, but not on 4xx client errors
      return !err.response || (err.response.status !== undefined && err.response.status >= 500);
    },
  });

  // Decrypt response data
  const decryptedData = await run("decrypt submission", rawFilePath, () =>
    decryptFormSubmission(encryptedSubmission, decryptionKey)
  );
  const decryptedResponse: FormSubmission = JSON.parse(decryptedData);
  logger.info("Downloaded and decrypted submission", {
    submissionId: responseName,
    attachmentCount: decryptedResponse.attachments?.length ?? 0,
  });

  // Save decrypted response to file
  const fileHandle = await run("open raw response file", rawFilePath, () =>
    dataDirectoryHandle.getFileHandle(`${responseName}.json`, { create: true })
  );

  const fileStream = await run("create raw response writable", rawFilePath, () =>
    fileHandle.createWritable({ keepExistingData: false })
  );
  await run("write raw response", rawFilePath, () => fileStream.write(decryptedData));
  await run("close raw response writable", rawFilePath, () => fileStream.close());

  const fileNameMapping: ResponseFilenameMapping = new Map();

  // check if there are files to download
  if (decryptedResponse.attachments && decryptedResponse.attachments.length > 0) {
    const attachmentsDirectoryHandle = await run(
      "get attachments directory",
      ATTACHMENTS_FOLDER,
      () =>
        workingDirectoryHandle.getDirectoryHandle(ATTACHMENTS_FOLDER, {
          create: true,
        })
    );

    // download the files into their own folder
    const responseAttachmentsDirectoryHandle = await run(
      "get submission attachments directory",
      `${ATTACHMENTS_FOLDER}/${responseName}`,
      () =>
        attachmentsDirectoryHandle.getDirectoryHandle(responseName, {
          create: true,
        })
    );

    const downloadResults: AttachmentDownloadResult[] = [];

    const responseAttachmentsWithRenameTo = deduplicateAttachmentFilenames(
      decryptedResponse.attachments
    );
    logger.info("Downloading submission attachments", {
      submissionId: responseName,
      attachmentCount: responseAttachmentsWithRenameTo.length,
    });
    // async download all attachments
    await Promise.all(
      responseAttachmentsWithRenameTo.map(async (attachment) => {
        const res = await downloadAttachment(
          responseAttachmentsDirectoryHandle,
          attachment,
          responseName,
          logger
        );
        downloadResults.push(res);
      })
    );

    // Build mapping of attachment ID to filenames
    downloadResults.forEach(({ id, originalName, actualName, isPotentiallyMalicious }) => {
      fileNameMapping.set(id, { originalName, actualName, isPotentiallyMalicious });
    });
  }

  // Perform integrity check and confirm submission
  await integrityCheckAndConfirm(responseName, dataDirectoryHandle, apiClient, logger);

  return {
    submissionId: responseName,
    createdAt: new Date(decryptedResponse.createdAt).toISOString(),
    rawAnswers: JSON.parse(decryptedResponse.answers),
    attachments: fileNameMapping,
  };
};

export const deduplicateAttachmentFilenames = (attachments: CompleteAttachment[]) => {
  const nameCount: Record<string, number> = {};
  return attachments.map((attachment) => {
    const lastDot = attachment.name.lastIndexOf(".");
    const base = lastDot !== -1 ? attachment.name.substring(0, lastDot) : attachment.name;
    const ext = lastDot !== -1 ? attachment.name.substring(lastDot) : "";
    const key = attachment.name;
    const count = nameCount[key] || 0;
    nameCount[key] = count + 1;
    let renameTo = attachment.name;
    if (count > 0) {
      renameTo = `${base} (${count})${ext}`;
    }
    return { ...attachment, renameTo };
  });
};

const downloadAttachment = async (
  responseAttachmentsDirectoryHandle: FileSystemDirectoryHandle,
  attachment: CompleteAttachment,
  responseName: string,
  logger: ResponseDownloadLogger
): Promise<AttachmentDownloadResult> => {
  const run = <T>(operation: string, path: string, action: () => Promise<T>) =>
    logDownloadOperation(logger, { submissionId: responseName, operation, path }, action);
  const directoryPath = `${ATTACHMENTS_FOLDER}/${responseName}${attachment.isPotentiallyMalicious ? `/${MALICIOUS_ATTACHMENTS_FOLDER}` : ""}`;
  const path = `${directoryPath}/${attachment.renameTo}`;
  const response = await run("fetch attachment", path, async () => {
    const response = await fetch(attachment.downloadLink);

    // Ensure the fetch was successful
    if (!response.ok) {
      throw new Error(
        `DownloadAttachment HTTP Error status: ${response.status} ${response.statusText}`
      );
    }
    return response;
  });

  let attachmentDirectoryHandle = responseAttachmentsDirectoryHandle;

  if (attachment.isPotentiallyMalicious) {
    attachmentDirectoryHandle = await run(
      "get suspicious attachments directory",
      directoryPath,
      () =>
        responseAttachmentsDirectoryHandle.getDirectoryHandle(MALICIOUS_ATTACHMENTS_FOLDER, {
          create: true,
        })
    );
  }

  const fileHandle = await run("open attachment file", path, () =>
    attachmentDirectoryHandle.getFileHandle(`${attachment.renameTo}`, { create: true })
  );
  const fileStream = await run("create attachment writable", path, () =>
    fileHandle.createWritable({ keepExistingData: false })
  );

  await run("stream and close attachment", path, async () => {
    await response.body?.pipeTo(fileStream);
  });

  return {
    id: attachment.id,
    originalName: attachment.name,
    actualName: attachment.renameTo || attachment.name,
    isPotentiallyMalicious: attachment.isPotentiallyMalicious,
  };
};

const integrityCheckAndConfirm = async (
  submissionName: string,
  dataDirectoryHandle: FileSystemDirectoryHandle,
  apiClient: GCFormsApiClient,
  logger: ResponseDownloadLogger
) => {
  const path = `${SOURCE_FOLDER}/${RAW_RESPONSE_FOLDER}/${submissionName}.json`;
  const run = <T>(operation: string, action: () => Promise<T>) =>
    logDownloadOperation(logger, { submissionId: submissionName, operation, path }, action);
  try {
    // Load file into memory
    const fileHandle = await run("open raw response for integrity check", () =>
      dataDirectoryHandle.getFileHandle(`${submissionName}.json`)
    );
    const file = await run("get raw response snapshot", () => fileHandle.getFile());
    const fileContent = await run("read raw response for integrity check", () => file.text());
    const {
      answers,
      checksum,
      confirmationCode,
    }: { answers: string; checksum: string; confirmationCode: string } = JSON.parse(fileContent);

    // Calculate checksum
    const calculatedChecksum = await md5(answers);

    if (calculatedChecksum !== checksum) {
      throw new Error(`Checksum mismatch for submission ${submissionName}. File removed.`);
    }

    // If checksums match, confirm the submission
    await withRetry(() => apiClient.confirmFormSubmission(submissionName, confirmationCode), {
      maxRetries: 6,
      onRetry: (attempt, error) => {
        const cause = error instanceof Error && error.cause ? error.cause : null;
        logger.info(`Attempt ${attempt} to confirm submission ${submissionName} failed: ${error}`, {
          cause,
        });
      },
      onFinalFailure: async (error, totalAttempts) => {
        const cause = error instanceof Error && error.cause ? error.cause : null;
        logger.error(
          `Failed to confirm submission ${submissionName} after ${totalAttempts} attempts: ${error}`,
          { cause }
        );
      },
      isRetryable: (error) => {
        const err = error as { response?: { status?: number } };
        // Retry on network errors or 5xx server errors, but not on 4xx client errors
        return !err.response || (err.response.status !== undefined && err.response.status >= 500);
      },
    });
  } catch (error) {
    // Delete failed file from the directory
    await run("remove failed raw response", () =>
      dataDirectoryHandle.removeEntry(`${submissionName}.json`)
    );
    throw new Error(`Integrity check and confirm failed for submission ${submissionName}`, {
      cause: error,
    });
  }
};
