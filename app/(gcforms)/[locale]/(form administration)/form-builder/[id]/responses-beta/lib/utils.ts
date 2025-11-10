/* eslint-disable no-await-in-loop */
import axios from "axios";
import { SignJWT } from "jose";
import { md5 } from "hash-wasm";
import { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { GCFormsApiClient } from "./apiClient";

import type {
  EncryptedFormSubmission,
  NewFormSubmission,
  PrivateApiKey,
  FormSubmission,
  CompleteAttachment,
} from "./types";
import { ATTACHMENTS_FOLDER, RAW_RESPONSE_FOLDER } from "./constants";

// import { getSubmissionByFormat } from "./responseRender";

/*
Import a PEM encoded RSA private key, to use for RSA-PSS signing.
Takes a string containing the PEM encoded key, and returns a Promise
that will resolve to a CryptoKey representing the private key.
*/
export function importPrivateKeySign(pem: string): Promise<CryptoKey> {
  // fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length - 1);

  return window.crypto.subtle.importKey(
    "pkcs8",
    Buffer.from(pemContents, "base64"),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    true,
    ["sign"]
  );
}

/*
Import a PEM encoded RSA private key, to use for RSA-PSS signing.
Takes a string containing the PEM encoded key, and returns a Promise
that will resolve to a CryptoKey representing the private key.
*/
export function importPrivateKeyDecrypt(pem: string): Promise<CryptoKey> {
  // fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length - 1);

  return window.crypto.subtle.importKey(
    "pkcs8",
    Buffer.from(pemContents, "base64"),
    {
      name: "RSA-OAEP",

      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
}

export async function getAccessTokenFromApiKey(apiKey: PrivateApiKey): Promise<string> {
  const zitadelURL = process.env.NEXT_PUBLIC_ZITADEL_URL;
  if (!zitadelURL) {
    return Promise.reject(new Error("Zitadel URL is not set."));
  }

  return importPrivateKeySign(apiKey.key).then((privateKey) => {
    const jwtSigner = new SignJWT()
      .setProtectedHeader({
        alg: "RS256",
        kid: apiKey.keyId,
      })
      .setIssuedAt()
      .setIssuer(apiKey.userId)
      .setSubject(apiKey.userId)
      .setAudience(zitadelURL) // Expected audience for the JWT token is the IdP external domain
      .setExpirationTime("1 minute"); // long enough for the introspection to happen

    return jwtSigner.sign(privateKey).then((jwtSignedToken) => {
      return axios
        .post(
          `${zitadelURL}/oauth/v2/token`,
          new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwtSignedToken,
            scope: `openid profile urn:zitadel:iam:org:project:id:275372254274006635:aud`,
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((response) => response.data.access_token)
        .catch((error) => {
          throw new Error("Failed to generate access token", { cause: error });
        });
    });
  });
}

const decryptFormSubmission = async (
  encryptedSubmission: EncryptedFormSubmission,
  privateKey: CryptoKey
) => {
  const decryptionKey = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    Buffer.from(encryptedSubmission.encryptedKey, "base64")
  );

  const decryptedNonce = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    Buffer.from(encryptedSubmission.encryptedNonce, "base64")
  );

  const decryptedAuthTag = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    Buffer.from(encryptedSubmission.encryptedAuthTag, "base64")
  );

  const encryptedResponses = Buffer.from(encryptedSubmission.encryptedResponses, "base64");
  const singleUseKey = await window.crypto.subtle.importKey(
    "raw",
    decryptionKey,
    "AES-GCM",
    false,
    ["decrypt"]
  );

  const decryptedData = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decryptedNonce },
    singleUseKey,
    Buffer.concat([encryptedResponses, Buffer.from(decryptedAuthTag)])
  );

  return new TextDecoder().decode(decryptedData);
};

const downloadFormSubmissions = async ({
  directoryHandle,
  dataDirectoryHandle,
  apiClient,
  privateApiKey,
  submissions,
  signal,
}: {
  directoryHandle: FileSystemDirectoryHandle;
  dataDirectoryHandle: FileSystemDirectoryHandle;
  apiClient: GCFormsApiClient;
  privateApiKey: PrivateApiKey;
  submissions: NewFormSubmission[];
  signal?: AbortSignal;
}) => {
  if (!dataDirectoryHandle || !submissions.length) {
    throw new Error("Invalid directory handle or no submissions to process.");
  }

  const decryptionKey = await importPrivateKeyDecrypt(privateApiKey.key);

  const downloadPromises = submissions.map(async (submission) => {
    // Check abort signal before each download
    if (signal?.aborted) {
      throw new DOMException("Download aborted", "AbortError");
    }

    try {
      const encryptedSubmission = await apiClient.getFormSubmission(submission.name, signal);

      const decryptedData = await decryptFormSubmission(encryptedSubmission, decryptionKey);

      const decryptedResponse: FormSubmission = JSON.parse(decryptedData);

      const fileHandle = await dataDirectoryHandle.getFileHandle(`${submission.name}.json`, {
        create: true,
      });
      const fileStream = await fileHandle.createWritable({ keepExistingData: false });
      await fileStream.write(decryptedData);
      await fileStream.close();

      // check if there are files to download
      if (decryptedResponse.attachments && decryptedResponse.attachments.length > 0) {
        const attachmentsDirectoryHandle = await directoryHandle.getDirectoryHandle(
          ATTACHMENTS_FOLDER,
          {
            create: true,
          }
        );

        // download the files into their own folder
        const fileDir = await attachmentsDirectoryHandle.getDirectoryHandle(submission.name, {
          create: true,
        });
        await Promise.all(
          decryptedResponse.attachments.map((attachment) => downloadAttachment(fileDir, attachment))
        );
      }

      // Return the submission data for CSV writing
      return {
        submissionId: submission.name,
        createdAt: new Date(decryptedResponse.createdAt).toISOString(),
        rawAnswers: JSON.parse(decryptedResponse.answers),
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`Failed to download submission ${submission.name}: ${(error as Error).message}`);
      throw error;
    }
  });
  const results = await Promise.all(downloadPromises);
  return results;
};

const downloadAttachment = async (
  dir: FileSystemDirectoryHandle,
  attachment: CompleteAttachment
) => {
  const response = await fetch(attachment.downloadLink);
  // Ensure the fetch was successful
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const fileDir = await dir.getDirectoryHandle(attachment.id, { create: true });
  const fileStream = await fileDir
    .getFileHandle(`${attachment.name}`, { create: true })
    .then((handle) => handle.createWritable({ keepExistingData: false }));

  await response.body?.pipeTo(fileStream);
};

const integrityCheckAndConfirm = async (
  submissionNames: string[],
  dir: FileSystemDirectoryHandle,
  apiClient: GCFormsApiClient,
  signal?: AbortSignal
) => {
  for (const submissionName of submissionNames) {
    // Check abort signal before each confirmation
    if (signal?.aborted) {
      throw new DOMException("Confirmation aborted", "AbortError");
    }

    // Load file into memory
    const fileHandle = await dir.getFileHandle(`${submissionName}.json`);
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
      // Delete failed file from the directory
      await dir.removeEntry(`${submissionName}.json`);
      throw new Error(`Checksum mismatch for submission ${submissionName}. File removed.`);
    }
    // If checksums match, confirm the submission
    await apiClient.confirmFormSubmission(submissionName, confirmationCode, signal);
  }
};

export const downloadAndConfirmFormSubmissions = async ({
  directoryHandle,
  apiClient,
  privateApiKey,
  submissions,
  signal,
}: {
  directoryHandle: FileSystemDirectoryHandle;
  apiClient: GCFormsApiClient;
  privateApiKey: PrivateApiKey;
  submissions: NewFormSubmission[];
  signal?: AbortSignal;
}) => {
  if (!directoryHandle || !submissions.length) {
    throw new Error("Invalid directory handle or no submissions to process.");
  }

  const dataDirectoryHandle: FileSystemDirectoryHandle = await directoryHandle.getDirectoryHandle(
    RAW_RESPONSE_FOLDER,
    { create: true }
  );

  const submissionData = await downloadFormSubmissions({
    directoryHandle,
    dataDirectoryHandle,
    apiClient,
    privateApiKey,
    submissions,
    signal,
  });
  const results = await integrityCheckAndConfirm(
    submissions.map((s) => s.name),
    dataDirectoryHandle,
    apiClient,
    signal
  );

  return { results, submissionData };
};

export function createSubArrays<T>(arr: T[], size: number) {
  const subArrays = [];
  for (let i = 0; i < arr.length; i += size) {
    subArrays.push(arr.slice(i, i + size));
  }
  return subArrays;
}
