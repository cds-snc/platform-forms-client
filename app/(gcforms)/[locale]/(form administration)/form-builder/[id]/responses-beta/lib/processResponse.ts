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
}) => {
  const confirmedResponse = await downloadAndConfirmResponse({
    workingDirectoryHandle,
    apiClient,
    decryptionKey,
    responseName: responseName,
  });

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

const downloadAndConfirmResponse = async ({
  workingDirectoryHandle,
  apiClient,
  decryptionKey,
  responseName,
}: {
  workingDirectoryHandle: FileSystemDirectoryHandle;
  apiClient: GCFormsApiClient;
  decryptionKey: CryptoKey;
  responseName: string;
}) => {
  // Get or create raw data directory
  const dataDirectoryHandle: FileSystemDirectoryHandle =
    await workingDirectoryHandle.getDirectoryHandle(RAW_RESPONSE_FOLDER, { create: true });

  // Retrieve encrypted response from API
  const encryptedSubmission = await apiClient.getFormSubmission(responseName);

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
  await integrityCheckAndConfirm(responseName, dataDirectoryHandle, apiClient);

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

    await Promise.all(
      decryptedResponse.attachments.map((attachment) =>
        downloadAttachment(responseAttachmentsDirectoryHandle, attachment)
      )
    );
  }

  return {
    submissionId: responseName,
    createdAt: new Date(decryptedResponse.createdAt).toISOString(),
    rawAnswers: JSON.parse(decryptedResponse.answers),
  };
};

const downloadAttachment = async (
  responseAttachmentsDirectoryHandle: FileSystemDirectoryHandle,
  attachment: CompleteAttachment
) => {
  const response = await fetch(attachment.downloadLink);
  // Ensure the fetch was successful
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Create UUID folder for each attachment
  const fileDir = await responseAttachmentsDirectoryHandle.getDirectoryHandle(attachment.id, {
    create: true,
  });

  const fileStream = await fileDir
    .getFileHandle(`${attachment.name}`, { create: true })
    .then((handle) => handle.createWritable({ keepExistingData: false }));

  await response.body?.pipeTo(fileStream);
};

const integrityCheckAndConfirm = async (
  submissionName: string,
  dataDirectoryHandle: FileSystemDirectoryHandle,
  apiClient: GCFormsApiClient
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
    await apiClient.confirmFormSubmission(submissionName, confirmationCode);
  } catch (error) {
    // Delete failed file from the directory
    await dataDirectoryHandle.removeEntry(`${submissionName}.json`);
    throw new Error(`Integrity check and confirm failed for submission ${submissionName}`, {
      cause: error,
    });
  }
};
