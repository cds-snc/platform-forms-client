"use server";
import * as jose from "jose";
import axios, { AxiosError } from "axios";
import crypto from "crypto";
import { prisma } from "@lib/integration/prismaConnector";
import { logMessage } from "@lib/logger";
import { revalidatePath } from "next/cache";
import { getAppSetting, decryptSetting } from "@lib/appSettings";
import { safeJSONParse } from "@lib/utils";
import { logEvent } from "@lib/auditLogs";
import { authCheckAndThrow } from "@lib/actions";
import { checkUserHasTemplateOwnership } from "@lib/templates";

type ZidatelAministrationKey = {
  type: string;
  keyId: string;
  key: string;
  expirationDate: string;
  userId: string;
};

const getZitadelSettings = async (): Promise<{
  zitadelAdministrationKey: ZidatelAministrationKey;
  zitadelProvider: string;
}> => {
  const [encryptedAdministrationKey, zitadelProvider] = await Promise.all([
    getAppSetting("zitadelAdministrationKey"),
    getAppSetting("zitadelProvider"),
  ]);

  if (!zitadelProvider) throw new Error("No value set for Zitadel Provider Setting");

  if (!encryptedAdministrationKey)
    throw new Error("No value set for Zitadel Administration Setting");

  const zitadelAdministrationKey: ZidatelAministrationKey | undefined = safeJSONParse(
    decryptSetting(encryptedAdministrationKey)
  );

  if (!zitadelAdministrationKey)
    throw new Error("Zitadel Adminstration Setting is not a valid JSON String");

  return { zitadelAdministrationKey, zitadelProvider };
};

const getAccessToken = async ({
  zitadelProvider,
  zitadelAdministrationKey,
}: {
  zitadelProvider: string;
  zitadelAdministrationKey: ZidatelAministrationKey;
}) => {
  const alg = "RS256";
  const privateKey = crypto.createPrivateKey({ key: zitadelAdministrationKey.key });
  const serviceUserId = zitadelAdministrationKey.userId;
  const kid = zitadelAdministrationKey.keyId;
  const jwt = await new jose.SignJWT()
    .setProtectedHeader({ alg, kid })
    .setIssuedAt()
    .setIssuer(serviceUserId)
    .setSubject(serviceUserId)
    .setAudience(zitadelProvider)
    .setExpirationTime("1h")
    .sign(privateKey);

  return axios
    .post(
      `${zitadelProvider}/oauth/v2/token`,
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
  const { zitadelProvider } = await getZitadelSettings();
  const userId = await axios
    .post(
      `${zitadelProvider}/management/v1/users/machine`,
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
  const { zitadelProvider } = await getZitadelSettings();

  const keyId = await axios
    .post(
      `${zitadelProvider}/management/v1/users/${userId}/keys`,
      {
        type: "KEY_TYPE_JSON",
        publicKey: Buffer.from(publicKey).toString("base64"),
        // Keeping as comment in case we decide to activate expiration dates
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
  const { ability } = await authCheckAndThrow();
  await checkUserHasTemplateOwnership(ability, templateId);
  const { zitadelProvider, zitadelAdministrationKey } = await getZitadelSettings();

  const { id: serviceAccountId, publicKeyId } =
    (await prisma.apiServiceAccount.findUnique({
      where: {
        templateId: templateId,
      },
      select: { id: true, publicKeyId: true },
    })) ?? {};

  if (!serviceAccountId || !publicKeyId) {
    throw new Error("No Key Exists in GCForms DB");
  }

  const accessToken = await getAccessToken({ zitadelProvider, zitadelAdministrationKey });

  await axios
    .delete(`${zitadelProvider}/management/v1/users/${serviceAccountId}`, {
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

  logEvent(
    ability.userID,
    { type: "ServiceAccount" },
    "DeleteAPIKey",
    `User :${ability.userID} deleted service account ${serviceAccountId} `
  );

  revalidatePath(
    "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api",
    "page"
  );
};
export const checkKeyExists = async (templateId: string) => {
  const { ability } = await authCheckAndThrow();
  await checkUserHasTemplateOwnership(ability, templateId);

  const { zitadelProvider, zitadelAdministrationKey } = await getZitadelSettings();

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
  const accessToken = await getAccessToken({ zitadelProvider, zitadelAdministrationKey });

  // Add code to check if a key exists

  const remoteKey = await axios
    .get(`${zitadelProvider}/management/v1/users/${userId}/keys/${publicKeyId}`, {
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
  const { ability } = await authCheckAndThrow();
  await checkUserHasTemplateOwnership(ability, templateId);

  const { zitadelProvider, zitadelAdministrationKey } = await getZitadelSettings();

  const { id: serviceAccountId, publicKeyId } =
    (await prisma.apiServiceAccount.findUnique({
      where: {
        templateId: templateId,
      },
      select: { id: true, publicKeyId: true },
    })) ?? {};

  if (!serviceAccountId || !publicKeyId) {
    throw new Error("No Key Exists in GCForms DB");
  }

  const accessToken = await getAccessToken({ zitadelAdministrationKey, zitadelProvider });
  await axios
    .delete(`${zitadelProvider}/management/v1/users/${serviceAccountId}/keys/${publicKeyId}`, {
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

  const keyId = await uploadKey(publicKey, serviceAccountId, accessToken);
  await prisma.apiServiceAccount.update({
    where: {
      templateId,
    },
    data: {
      publicKey: publicKey,
      publicKeyId: keyId,
    },
  });

  logEvent(
    ability.userID,
    { type: "ServiceAccount" },
    "RefreshAPIKey",
    `User :${ability.userID} refreshed API key for service account ${serviceAccountId} `
  );

  return { type: "serviceAccount", keyId, key: privateKey, userId: serviceAccountId };
};

export const createKey = async (templateId: string) => {
  const { ability } = await authCheckAndThrow();
  await checkUserHasTemplateOwnership(ability, templateId);

  const { zitadelProvider, zitadelAdministrationKey } = await getZitadelSettings();

  const accessToken = await getAccessToken({ zitadelAdministrationKey, zitadelProvider });

  const serviceAccountId = await createUser(templateId, accessToken);

  const { privateKey, publicKey } = generateKeys();

  const keyId = await uploadKey(publicKey, serviceAccountId, accessToken);

  await prisma.apiServiceAccount.create({
    data: {
      id: serviceAccountId,
      publicKeyId: keyId,
      templateId,
      publicKey,
    },
  });

  logEvent(
    ability.userID,
    { type: "ServiceAccount" },
    "CreateAPIKey",
    `User :${ability.userID} created API key for service account ${serviceAccountId} `
  );

  revalidatePath(
    "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api",
    "page"
  );

  return { type: "serviceAccount", keyId, key: privateKey, userId: serviceAccountId };
};

// Look at possibly moving this to the browser so the GCForms System is never in possession
// of the private key.

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
