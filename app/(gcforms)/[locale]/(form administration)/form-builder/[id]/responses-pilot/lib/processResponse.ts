import type { FileSystemDirectoryHandle, FileSystemFileHandle } from "native-file-system-adapter";
import { CompleteAttachment, FormSubmission } from "./types";
import { decryptFormSubmission } from "./utils";
import { ATTACHMENTS_FOLDER, RAW_RESPONSE_FOLDER } from "./constants";
import { FormProperties } from "@root/lib/types";
import { GCFormsApiClient } from "./apiClient";
import { writeHtml } from "./htmlWriter";
import { writeRow } from "./csvWriter";
import { TFunction } from "i18next";
import { md5 } from "hash-wasm";
import { withRetry } from "@root/lib/utils/retry";
import { ResponseDownloadLogger } from "./logger";

export const processResponse = async ({
  setProcessedSubmissionIds,
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
  setProcessedSubmissionIds: React.Dispatch<React.SetStateAction<Set<string>>>;
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

  // console.log(confirmedResponse.attachments);

  if (confirmedResponse.attachments) {
    const attachmentsDirectory = await workingDirectoryHandle.getDirectoryHandle(
      ATTACHMENTS_FOLDER,
      { create: true }
    );
    const responseAttachmentsDirectory = await attachmentsDirectory.getDirectoryHandle(
      responseName,
      { create: true }
    );

    // Write a mapping file for attachments
    const mappingFileHandle = await responseAttachmentsDirectory.getFileHandle("mapping.json", {
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

  // Record individual submission ids so we have an accurate count
  setProcessedSubmissionIds((prev) => {
    const next = new Set(prev);
    next.add(responseName);
    return next;
  });
};

export type ResponseFilenameMapping = Map<string, { originalName: string; actualName: string }>;

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

  // Perform integrity check and confirm submission
  await integrityCheckAndConfirm(responseName, dataDirectoryHandle, apiClient, logger);

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

    const downloadResults = await Promise.all(
      decryptedResponse.attachments.map((attachment) =>
        downloadAttachment(responseAttachmentsDirectoryHandle, attachment)
      )
    );

    // Build mapping of attachment ID to filenames
    downloadResults.forEach(({ id, originalName, actualName }) => {
      fileNameMapping.set(id, { originalName, actualName });
    });
  }

  return {
    submissionId: responseName,
    createdAt: new Date(decryptedResponse.createdAt).toISOString(),
    rawAnswers: JSON.parse(decryptedResponse.answers),
    attachments: fileNameMapping,
  };
};

const downloadAttachment = async (
  responseAttachmentsDirectoryHandle: FileSystemDirectoryHandle,
  attachment: CompleteAttachment
): Promise<{ id: string; originalName: string; actualName: string }> => {
  const response = await fetch(attachment.downloadLink);
  // Ensure the fetch was successful
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const uniqueFilename = await getUniqueFileName(
    responseAttachmentsDirectoryHandle,
    attachment.name
  );

  const fileStream = await responseAttachmentsDirectoryHandle
    .getFileHandle(`${uniqueFilename}`, { create: true })
    .then((handle) => handle.createWritable({ keepExistingData: false }));

  await response.body?.pipeTo(fileStream);

  return {
    id: attachment.id,
    originalName: attachment.name,
    actualName: uniqueFilename,
  };
};

const getUniqueFileName = async (
  directoryHandle: FileSystemDirectoryHandle,
  fileName: string
): Promise<string> => {
  // Split filename into name and extension
  const lastDotIndex = fileName.lastIndexOf(".");
  const name = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
  const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : "";

  let uniqueFileName = fileName;
  let counter = 1;

  // Check if file exists and increment counter until we find a unique name
  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await directoryHandle.getFileHandle(uniqueFileName);
      // File exists, try next number
      uniqueFileName = `${name} (${counter})${extension}`;
      counter++;
    } catch {
      // File doesn't exist, we can use this name
      break;
    }
  }

  return uniqueFileName;
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
