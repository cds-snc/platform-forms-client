"use server";
import * as jose from "jose";
import axios, { AxiosError } from "axios";
import crypto from "crypto";
import { prisma } from "@lib/integration/prismaConnector";
import { logMessage } from "@lib/logger";
import { revalidatePath } from "next/cache";
import { getAppSetting, decryptSetting } from "@lib/appSettings";
import { safeJSONParse } from "@lib/utils";

const getAccessToken = async () => {
  const encryptedSetting = await getAppSetting("zitadelAdministrationKey");

  if (!encryptedSetting) throw new Error("No value set for Zitadel Administration Setting");

  const zitadelPrivate = safeJSONParse(decryptSetting(encryptedSetting));

  if (!zitadelPrivate) throw new Error("Zitadel Adminstration Setting is not a valid JSON String");

  const alg = "RS256";
  const privateKey = crypto.createPrivateKey({ key: zitadelPrivate.key });
  const serviceUserId = zitadelPrivate.userId;
  const kid = zitadelPrivate.keyId;
  const jwt = await new jose.SignJWT()
    .setProtectedHeader({ alg, kid })
    .setIssuedAt()
    .setIssuer(serviceUserId)
    .setSubject(serviceUserId)
    .setAudience(process.env.ZITADEL_ISSUER ?? "")
    .setExpirationTime("1h")
    .sign(privateKey);

  return axios
    .post(
      `${process.env.ZITADEL_ISSUER}/oauth/v2/token`,
      new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
        scope: "openid urn:zitadel:iam:org:project:id:zitadel:aud",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((res) => res.data.access_token);
};

const createUser = async (templateId: string, accessToken: string): Promise<string> => {
  const userId = await axios
    .post(
      `${process.env.ZITADEL_ISSUER}/management/v1/users/machine`,
      {
        userName: templateId,
        name: templateId,
        description: `API Service account for form ${templateId}`,
        accessTokenType: "ACCESS_TOKEN_TYPE_JWT",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    )
    .then((res) => res.data.userId)
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Could not create User on Identity Provider");
    });
  logMessage.debug(`Service User ID: ${userId} `);
  return userId;
};

const uploadKey = async (
  publicKey: string,
  userId: string,
  accessToken: string
): Promise<string> => {
  const keyId = await axios
    .post(
      `${process.env.ZITADEL_ISSUER}/management/v1/users/${userId}/keys`,
      {
        type: "KEY_TYPE_JSON",
        publicKey: Buffer.from(publicKey).toString("base64"),
        // expirationDate: new Date().setDate(new Date().getDate() + 90),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    )
    .then((res) => res.data.keyId)
    .catch((err) => {
      if (err instanceof AxiosError) {
        logMessage.error(`${err.response?.data.code}: ${err.response?.data.message}`);
        logMessage.warn(err.response);
      }
      throw new Error("Failed to create key");
    });

  logMessage.debug(`Key ID: ${keyId}`);
  return keyId;
};

export const deleteKey = async (templateId: string) => {
  const { id: userId, publicKeyId } =
    (await prisma.apiServiceAccount.findUnique({
      where: {
        templateId: templateId,
      },
      select: { id: true, publicKeyId: true },
    })) ?? {};

  if (!userId || !publicKeyId) {
    throw new Error("No Key Exists in GCForms DB");
  }

  const accessToken = await getAccessToken();

  await axios
    .delete(`${process.env.ZITADEL_ISSUER}/management/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Failed to delete key");
    });

  await prisma.apiServiceAccount.delete({
    where: {
      templateId: templateId,
    },
  });

  revalidatePath(
    "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api",
    "page"
  );
};
export const checkKey = async (templateId: string) => {
  const { id: userId, publicKeyId } =
    (await prisma.apiServiceAccount.findUnique({
      where: {
        templateId: templateId,
      },
      select: { id: true, publicKeyId: true },
    })) ?? {};

  if (!userId || !publicKeyId) {
    return false;
  }

  // Ensure the key is in sync with Zidatel
  const accessToken = await getAccessToken();

  // Add code to check if a key exists

  const remoteKey = await axios
    .get(`${process.env.ZITADEL_ISSUER}/management/v1/users/${userId}/keys/${publicKeyId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })
    .then((res) => res.data.key)
    .catch((err) => {
      logMessage.error(err);
      return null;
    });

  if (publicKeyId && remoteKey) {
    return true;
  }
  // Key are out of sync or user does not exist
  return false;
};

export const refreshKey = async (templateId: string) => {
  const { id: userId, publicKeyId } =
    (await prisma.apiServiceAccount.findUnique({
      where: {
        templateId: templateId,
      },
      select: { id: true, publicKeyId: true },
    })) ?? {};

  if (!userId || !publicKeyId) {
    throw new Error("No Key Exists in GCForms DB");
  }

  const accessToken = await getAccessToken();
  await axios
    .delete(`${process.env.ZITADEL_ISSUER}/management/v1/users/${userId}/keys/${publicKeyId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })
    .catch((err) => {
      logMessage.error(err);
      return null;
    });

  const { privateKey, publicKey } = generateKeys();

  const keyId = await uploadKey(publicKey, userId, accessToken);
  await prisma.apiServiceAccount.update({
    where: {
      templateId,
    },
    data: {
      publicKey: publicKey,
      publicKeyId: keyId,
    },
  });

  return { type: "serviceAccount", keyId, key: privateKey, userId };
};

export const createKey = async (templateId: string) => {
  // Add code to generate key

  const accessToken = await getAccessToken();

  const userId = await createUser(templateId, accessToken);

  const { privateKey, publicKey } = generateKeys();

  const keyId = await uploadKey(publicKey, userId, accessToken);

  await prisma.apiServiceAccount.create({
    data: {
      id: userId,
      publicKeyId: keyId,
      templateId,
      publicKey,
    },
  });

  revalidatePath(
    "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api",
    "page"
  );

  return { type: "serviceAccount", keyId, key: privateKey, userId };
};

const generateKeys = () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
  return { privateKey, publicKey };
};
