/* eslint-disable no-await-in-loop */
import axios, { type AxiosInstance } from "axios";
import type {
  EncryptedFormSubmission,
  FormSubmissionProblem,
  NewFormSubmission,
  PrivateApiKey,
} from "./types";
import { SignJWT } from "jose";
import { FileSystemDirectoryHandle } from "native-file-system-adapter";
import md5 from "md5";
import { logMessage } from "@lib/logger";

export class TokenRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenRateLimitError";
  }
}

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

export class GCFormsApiClient {
  private formId: string;
  private httpClient: AxiosInstance;

  public constructor(formId: string, apiUrl: string, accessToken: string) {
    this.formId = formId;
    this.httpClient = axios.create({
      baseURL: apiUrl,
      timeout: 3000,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  public getFormTemplate(): Promise<Record<string, unknown>> {
    return this.httpClient
      .get<Record<string, unknown>>(`/forms/${this.formId}/template`)
      .then((response) => response.data)
      .catch((error) => {
        throw new Error("Failed to retrieve form template", { cause: error });
      });
  }

  public getNewFormSubmissions(): Promise<NewFormSubmission[]> {
    return this.httpClient
      .get<NewFormSubmission[]>(`/forms/${this.formId}/submission/new`)
      .then((response) => response.data)
      .catch((error) => {
        throw new Error("Failed to retrieve new form submissions", {
          cause: error,
        });
      });
  }

  public getFormSubmission(submissionName: string): Promise<EncryptedFormSubmission> {
    return this.httpClient
      .get<EncryptedFormSubmission>(`/forms/${this.formId}/submission/${submissionName}`)
      .then((response) => response.data)
      .catch((error) => {
        if (error.response && error.response.status === 429) {
          throw new TokenRateLimitError("Rate limit exceeded. Please try again later.");
        } else {
          throw new Error("Failed to retrieve form submission", { cause: error });
        }
      });
  }

  public confirmFormSubmission(submissionName: string, confirmationCode: string): Promise<void> {
    return this.httpClient
      .put<void>(`/forms/${this.formId}/submission/${submissionName}/confirm/${confirmationCode}`)
      .then(() => Promise.resolve())
      .catch((error) => {
        throw new Error("Failed to confirm form submission", { cause: error });
      });
  }

  public reportProblemWithFormSubmission(
    submissionName: string,
    problem: FormSubmissionProblem
  ): Promise<void> {
    return this.httpClient
      .post<void>(`/forms/${this.formId}/submission/${submissionName}/problem`, problem, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(() => Promise.resolve())
      .catch((error) => {
        throw new Error("Failed to report problem with form submission", {
          cause: error,
        });
      });
  }
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

const downloadFormSubmissions = async (
  dir: FileSystemDirectoryHandle,
  apiClient: GCFormsApiClient,
  privateApiKey: PrivateApiKey,
  submissions: NewFormSubmission[]
) => {
  if (!dir || !submissions.length) {
    throw new Error("Invalid directory handle or no submissions to process.");
  }

  const decryptionKey = await importPrivateKeyDecrypt(privateApiKey.key);

  const downloadPromises = submissions.map(async (submission) => {
    try {
      const encryptedSubmission = await apiClient.getFormSubmission(submission.name);
      // Decrypt the submission using the private API key

      const decryptedData = await decryptFormSubmission(encryptedSubmission, decryptionKey);

      // Write the decrypted data to a file in the chosen directory

      const fileHandle = await dir.getFileHandle(`${submission.name}.json`, { create: true });
      const fileStream = await fileHandle.createWritable();
      await fileStream.write(decryptedData);
      await fileStream.close();

      // await apiClient.confirmFormSubmission(submission.name, encryptedSubmission.confirmationCode);
    } catch (error) {
      logMessage.error(`Failed to download submission ${submission.name}:`, error);

      throw error;
    }
  });
  await Promise.all(downloadPromises);
};

const integrityCheckAndConfirm = async (
  submissionNames: string[],
  dir: FileSystemDirectoryHandle,
  apiClient: GCFormsApiClient
) => {
  for (const submissionName of submissionNames) {
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

    const calculatedChecksum = md5(answers, { asBytes: true })
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (calculatedChecksum !== checksum) {
      throw new Error(`Checksum mismatch for submission ${submissionName}.`);
    }
    // If checksums match, confirm the submission
    await apiClient.confirmFormSubmission(submissionName, confirmationCode);
  }
};

export const downloadAndConfirmFormSubmissions = async (
  dir: FileSystemDirectoryHandle,
  apiClient: GCFormsApiClient,
  privateApiKey: PrivateApiKey,
  submissions: NewFormSubmission[]
) => {
  if (!dir || !submissions.length) {
    throw new Error("Invalid directory handle or no submissions to process.");
  }

  await downloadFormSubmissions(dir, apiClient, privateApiKey, submissions);
  await integrityCheckAndConfirm(
    submissions.map((s) => s.name),
    dir,
    apiClient
  );
};
