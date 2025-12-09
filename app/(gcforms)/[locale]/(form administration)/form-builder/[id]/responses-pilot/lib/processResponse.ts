import type { FileSystemDirectoryHandle, FileSystemFileHandle } from "native-file-system-adapter";
import { CompleteAttachment, FormSubmission } from "./types";
import { decryptFormSubmission } from "./utils";
import {
  ATTACHMENTS_FOLDER,
  MALICIOUS_ATTACHMENTS_FOLDER,
  MAPPING_FILENAME,
  RAW_RESPONSE_FOLDER,
} from "./constants";
import { FormProperties } from "@root/lib/types";
import { GCFormsApiClient } from "./apiClient";
import { writeHtml } from "./htmlWriter";
import { writeRow } from "./csvWriter";
import { TFunction } from "i18next";
import { md5 } from "hash-wasm";
import { withRetry } from "@root/lib/utils/retry";
import { ResponseDownloadLogger } from "./logger";

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
  t: TFunction<string | string[], undefined>;
  logger: ResponseDownloadLogger;
}) => {
  const confirmedResponse = await downloadAndConfirmResponse({
    workingDirectoryHandle,
    apiClient,
    decryptionKey,
    responseName: responseName,
    logger,
  });

  if (confirmedResponse.attachments && confirmedResponse.attachments.size > 0) {
    if (
      Array.from(confirmedResponse.attachments.values()).some((att) => att.isPotentiallyMalicious)
    ) {
      setHasMaliciousAttachments(true);
    }

    const attachmentsDirectory = await workingDirectoryHandle.getDirectoryHandle(
      ATTACHMENTS_FOLDER,
      { create: true }
    );
    const responseAttachmentsDirectory = await attachmentsDirectory.getDirectoryHandle(
      responseName,
      { create: true }
    );

    // Write a mapping file for attachments
    const mappingFileHandle = await responseAttachmentsDirectory.getFileHandle(MAPPING_FILENAME, {
      create: true,
    });
    const mappingFileStream = await mappingFileHandle.createWritable({ keepExistingData: false });
    await mappingFileStream.write(
      JSON.stringify(Object.fromEntries(confirmedResponse.attachments), null, 2)
    );
    await mappingFileStream.close();
  }

  switch (selectedFormat) {
    case "html":
      if (!htmlDirectoryHandle) {
        throw new Error("HTML directory handle is null");
      }

      await writeHtml({
        htmlDirectoryHandle,
        formTemplate,
        submission: confirmedResponse,
        attachments: confirmedResponse.attachments,
        formId,
        t,
      });
      break;
    default:
      if (!csvFileHandle) {
        throw new Error("CSV file handle is null");
      }

      await writeRow({
        submissionId: confirmedResponse.submissionId,
        createdAt: confirmedResponse.createdAt,
        formTemplate,
        csvFileHandle,
        rawAnswers: confirmedResponse.rawAnswers,
        attachments: confirmedResponse.attachments,
      });
      break;
  }

  incrementProcessedSubmissionsCount();
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
  // Get or create raw data directory
  const dataDirectoryHandle: FileSystemDirectoryHandle =
    await workingDirectoryHandle.getDirectoryHandle(RAW_RESPONSE_FOLDER, { create: true });

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
  const decryptedData = await decryptFormSubmission(encryptedSubmission, decryptionKey);
  const decryptedResponse: FormSubmission = JSON.parse(decryptedData);

  // Save decrypted response to file
  const fileHandle = await dataDirectoryHandle.getFileHandle(`${responseName}.json`, {
    create: true,
  });

  const fileStream = await fileHandle.createWritable({ keepExistingData: false });
  await fileStream.write(decryptedData);
  await fileStream.close();

  const fileNameMapping: ResponseFilenameMapping = new Map();

  // check if there are files to download
  if (decryptedResponse.attachments && decryptedResponse.attachments.length > 0) {
    const attachmentsDirectoryHandle = await workingDirectoryHandle.getDirectoryHandle(
      ATTACHMENTS_FOLDER,
      {
        create: true,
      }
    );

    // download the files into their own folder
    const responseAttachmentsDirectoryHandle = await attachmentsDirectoryHandle.getDirectoryHandle(
      responseName,
      {
        create: true,
      }
    );

    const downloadResults: AttachmentDownloadResult[] = [];

    const responseAttachmentsWithRenameTo = deduplicateAttachmentFilenames(
      decryptedResponse.attachments
    );

    // async download all attachments
    await Promise.all(
      responseAttachmentsWithRenameTo.map(async (attachment) => {
        const res = await downloadAttachment(responseAttachmentsDirectoryHandle, attachment);
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
  attachment: CompleteAttachment
): Promise<AttachmentDownloadResult> => {
  const response = await fetch(attachment.downloadLink);

  // Ensure the fetch was successful
  if (!response.ok) {
    throw new Error(
      `DownloadAttachment HTTP Error status: ${response.status} ${response.statusText}`
    );
  }

  let attachmentDirectoryHandle = responseAttachmentsDirectoryHandle;

  if (attachment.isPotentiallyMalicious) {
    attachmentDirectoryHandle = await responseAttachmentsDirectoryHandle.getDirectoryHandle(
      MALICIOUS_ATTACHMENTS_FOLDER,
      {
        create: true,
      }
    );
  }

  const fileStream = await attachmentDirectoryHandle
    .getFileHandle(`${attachment.renameTo}`, { create: true })
    .then((handle) => handle.createWritable({ keepExistingData: false }));

  await response.body?.pipeTo(fileStream);

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
  try {
    // Load file into memory
    const fileHandle = await dataDirectoryHandle.getFileHandle(`${submissionName}.json`);
    const file = await fileHandle.getFile();
    const fileContent = await file.text();
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
    await dataDirectoryHandle.removeEntry(`${submissionName}.json`);
    throw new Error(`Integrity check and confirm failed for submission ${submissionName}`, {
      cause: error,
    });
  }
};
