import axios from "axios";
import { SignJWT } from "jose";

import type { EncryptedFormSubmission, PrivateApiKey } from "./types";

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

  return importPrivateKeySign(apiKey.key).then(async (privateKey) => {
    const jwtSigner = new SignJWT()
      .setProtectedHeader({
        alg: "RS256",
        kid: apiKey.keyId,
      })
      .setIssuedAt(await serverTime())
      .setIssuer(apiKey.userId)
      .setSubject(apiKey.userId)
      .setAudience(zitadelURL) // Expected audience for the JWT token is the IdP external domain
      .setExpirationTime("1 minute"); // long enough for the introspection to happen

    return jwtSigner.sign(privateKey).then(async (jwtSignedToken) => {
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

export const decryptFormSubmission = async (
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

const serverTime = async () => {
  const response = await axios.get("/api/timecheck");
  const { serverTime }: { serverTime?: number } = response.data;
  if (!serverTime) {
    throw new Error("Could not retrieve server time for Access Token creation");
  }
  return serverTime;
};
