import { privateDecrypt, createDecipheriv } from "node:crypto";
import type { EncryptedFormSubmission, PrivateApiKey } from "./types.js";

export function decryptFormSubmission(
  encryptedSubmission: EncryptedFormSubmission,
  privateApiKey: PrivateApiKey
): string {
  try {
    const privateKey = {
      key: privateApiKey.key,
      oaepHash: "sha256",
    };

    const decryptedKey = privateDecrypt(
      privateKey,
      Buffer.from(encryptedSubmission.encryptedKey, "base64")
    );

    const decryptedNonce = privateDecrypt(
      privateKey,
      Buffer.from(encryptedSubmission.encryptedNonce, "base64")
    );

    const decryptedAuthTag = privateDecrypt(
      privateKey,
      Buffer.from(encryptedSubmission.encryptedAuthTag, "base64")
    );

    const gcmDecipher = createDecipheriv("aes-256-gcm", decryptedKey, decryptedNonce);

    gcmDecipher.setAuthTag(decryptedAuthTag);

    const encryptedData = Buffer.from(encryptedSubmission.encryptedResponses, "base64");

    const decryptedData = Buffer.concat([gcmDecipher.update(encryptedData), gcmDecipher.final()]);

    return decryptedData.toString("utf8");
  } catch (error) {
    throw new Error("Failed to decrypt form submission", { cause: error });
  }
}
