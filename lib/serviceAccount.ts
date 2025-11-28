import crypto from "crypto";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { logEvent } from "@lib/auditLogs";
import { authorization } from "@lib/privileges";
import * as ZitadelConnector from "@lib/integration/zitadelConnector";
import { logMessage } from "./logger";

type ApiPrivateKey = {
  type: string;
  keyId: string;
  key: string;
  userId: string;
  formId: string;
};

export const deleteKey = async (templateId: string) => {
  const { user } = await authorization.canEditForm(templateId);

  try {
    const serviceAccountID = await checkMachineUserExists(templateId);

    if (serviceAccountID) {
      await ZitadelConnector.deleteMachineUser(serviceAccountID);
    }

    await prisma.apiServiceAccount
      .deleteMany({
        where: {
          templateId: templateId,
        },
      })
      .catch((e) => prismaErrors(e, null));

    logEvent(
      user.id,
      { type: "ServiceAccount" },
      "DeleteAPIKey",
      `User :${user.id} deleted service account ${
        serviceAccountID ? `${serviceAccountID}` : `for template ${templateId}`
      }`
    );

    logEvent(
      user.id,
      { type: "Form", id: templateId },
      "DeleteAPIKey",
      `User :${user.id} deleted service account ${
        serviceAccountID ? `${serviceAccountID}` : `for template ${templateId}`
      }`
    );
  } catch (error) {
    logMessage.error(
      `API key for form ${templateId} failed to be deleted. Reason ${(error as Error).message}`
    );
    throw new Error("Failed to delete API key");
  }
};

export const checkMachineUserExists = async (templateId: string) => {
  await authorization.canEditForm(templateId);
  return ZitadelConnector.getMachineUser(templateId).then((r) => r?.userId);
};

/*
 * This function is used to get the public key id of the service account
 * associated with the templateId.
 */
const _getApiUserPublicKeyId = async (templateId: string) => {
  const result = { userId: null, publicKeyId: null };

  if (templateId === "0000") {
    return result;
  }

  await authorization.canEditForm(templateId);

  const { id: userId, publicKeyId } =
    (await prisma.apiServiceAccount.findUnique({
      where: {
        templateId: templateId,
      },
      select: { id: true, publicKeyId: true },
    })) ?? {};

  if (!userId || !publicKeyId) {
    return result;
  }

  return { userId, publicKeyId };
};

/*
 * This function is used to check if the key exists in the Zitadel
 * for the service account associated with the templateId.
 *
 * Returns the keyId if the key exists, otherwise returns false
 * If false the DB and the machine key may be out of sync.
 */
export const checkKeyExists = async (templateId: string) => {
  await authorization.canEditForm(templateId);

  const { userId, publicKeyId } = await _getApiUserPublicKeyId(templateId);

  if (!userId || !publicKeyId) {
    return false;
  }

  const remoteKey = await ZitadelConnector.getMachineUserKeyById(userId, publicKeyId);
  return remoteKey?.keyId === publicKeyId ? remoteKey.keyId : false;
};

export const createKey = async (templateId: string) => {
  const { user } = await authorization.canEditForm(templateId);

  try {
    const serviceAccountId = await ZitadelConnector.getMachineUser(templateId).then((user) => {
      // If a user does not exist then create one
      if (!user) {
        return ZitadelConnector.createMachineUser(
          templateId,
          `API Service account for form ${templateId}`
        ).then((r) => r.userId);
      }
      return user.userId;
    });

    const { privateKey, publicKey } = generateKeys();

    const keyId = await ZitadelConnector.createMachineKey(serviceAccountId, publicKey).then(
      (r) => r.keyId
    );

    await prisma.apiServiceAccount.create({
      data: {
        id: serviceAccountId,
        publicKeyId: keyId,
        templateId,
        publicKey,
      },
    });

    logEvent(
      user.id,
      { type: "ServiceAccount" },
      "CreateAPIKey",
      `User :${user.id} created API key for service account ${serviceAccountId}`
    );
    logEvent(
      user.id,
      { type: "Form", id: templateId },
      "CreateAPIKey",
      `User :${user.id} created API key for service account ${serviceAccountId}`
    );

    return buildApiPrivateKeyData(keyId, privateKey, serviceAccountId, templateId);
  } catch (error) {
    logMessage.error(
      `API key for form ${templateId} failed to be created. Reason ${(error as Error).message}`
    );
    throw new Error("Failed to create API key");
  }
};

export const refreshKey = async (templateId: string) => {
  const { user } = await authorization.canEditForm(templateId);

  try {
    // Get existing service account and key
    const { id: serviceAccountId, publicKeyId } =
      (await prisma.apiServiceAccount.findUnique({
        where: {
          templateId: templateId,
        },
        select: { id: true, publicKeyId: true },
      })) ?? {};

    if (!serviceAccountId || !publicKeyId) {
      throw new Error("No API key exists for this form");
    }

    await ZitadelConnector.deleteMachineKey(serviceAccountId, publicKeyId);

    // Generate new keys
    const { privateKey, publicKey } = generateKeys();

    // Create new machine key in Zitadel
    const keyId = await ZitadelConnector.createMachineKey(serviceAccountId, publicKey).then(
      (r) => r.keyId
    );

    // Update DB with new public key id and public key
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
      user.id,
      { type: "ServiceAccount" },
      "RefreshAPIKey",
      `User :${user.id} generated a new API key for service account ${serviceAccountId} `
    );

    return buildApiPrivateKeyData(keyId, privateKey, serviceAccountId, templateId);
  } catch (error) {
    logMessage.error(
      `API key for form ${templateId} failed to be refreshed. Reason ${(error as Error).message}`
    );
    throw new Error("Failed to refresh API key");
  }
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

function buildApiPrivateKeyData(
  keyId: string,
  key: string,
  userId: string,
  formId: string
): ApiPrivateKey {
  return {
    type: "serviceAccount",
    keyId,
    key,
    userId,
    formId,
  };
}
