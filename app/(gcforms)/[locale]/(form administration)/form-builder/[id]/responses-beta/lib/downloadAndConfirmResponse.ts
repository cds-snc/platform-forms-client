import { md5 } from "hash-wasm";
import { GCFormsApiClient } from "./apiClient";
import { ATTACHMENTS_FOLDER, RAW_RESPONSE_FOLDER } from "./constants";
import { CompleteAttachment, FormSubmission, PrivateApiKey } from "./types";
import { decryptFormSubmission, importPrivateKeyDecrypt } from "./utils";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";

export const downloadAndConfirmResponse = async ({
  workingDirectoryHandle,
  apiClient,
  privateApiKey,
  responseName,
}: {
  workingDirectoryHandle: FileSystemDirectoryHandle;
  apiClient: GCFormsApiClient;
  privateApiKey: PrivateApiKey;
  responseName: string;
}) => {
  const dataDirectoryHandle: FileSystemDirectoryHandle =
    await workingDirectoryHandle.getDirectoryHandle(RAW_RESPONSE_FOLDER, { create: true });

  const decryptionKey = await importPrivateKeyDecrypt(privateApiKey.key);

  const encryptedSubmission = await apiClient.getFormSubmission(responseName);

  const decryptedData = await decryptFormSubmission(encryptedSubmission, decryptionKey);
  const decryptedResponse: FormSubmission = JSON.parse(decryptedData);

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
