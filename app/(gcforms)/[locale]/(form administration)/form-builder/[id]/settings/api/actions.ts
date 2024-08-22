"use server";
import crypto from "crypto";
import { prisma } from "@lib/integration/prismaConnector";
import { logMessage } from "@lib/logger";
import { revalidatePath } from "next/cache";
import { logEvent } from "@lib/auditLogs";
import { authCheckAndThrow } from "@lib/actions";
import { checkUserHasTemplateOwnership } from "@lib/templates";
import { getZitadelClient } from "@lib/integration/zitadelConnector";

const createMachineUser = async (templateId: string) => {
  const zitadel = await getZitadelClient();
  const { userId } = await zitadel
    .addMachineUser({
      userName: templateId,
      name: templateId,
      description: `API Service account for form ${templateId}`,
      // Access Token Type 1 is JWT
      accessTokenType: 1,
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Could not create User on Identity Provider");
    });

  logMessage.debug(`Service User ID: ${userId} `);
  return userId;
};

const getMachineUser = async (templateId: string) => {
  const zitadel = await getZitadelClient();
  const { user } = await zitadel
    .getUserByLoginNameGlobal({
      loginName: templateId,
    })
    .catch(() => {
      // getUserByLoginNameGlobal throws if it cannot find the user
      return { user: undefined };
    });
  // If the service account does not exist for the template then create it.
  if (!user) {
    return createMachineUser(templateId);
  }
  return user.id;
};

const deleteMachineUser = async (userId: string) => {
  const zitadel = await getZitadelClient();
  await zitadel
    .removeUser({
      id: userId,
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Could not delete User on Identity Provider");
    });
  logMessage.debug(`Deleted Service User: ${userId}`);
};

const uploadKey = async (publicKey: string, userId: string): Promise<string> => {
  const zitadel = await getZitadelClient();
  const { keyId } = await zitadel
    .addMachineKey({
      userId: userId,
      // Key type 1 is JSON
      type: 1,
      expirationDate: undefined,
      publicKey: Buffer.from(publicKey),
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Failed to create key");
    });

  logMessage.debug(`Service User Key ID: ${keyId}`);
  return keyId;
};

export const deleteKey = async (templateId: string) => {
  const { ability } = await authCheckAndThrow();
  await checkUserHasTemplateOwnership(ability, templateId);

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

  const zitadel = await getZitadelClient();
  await zitadel
    .removeMachineKey({
      userId: serviceAccountId,
      keyId: publicKeyId,
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

  await deleteMachineUser(serviceAccountId);

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

  const zitadel = await getZitadelClient();
  const remoteKey = await zitadel
    .getMachineKeyByIDs({
      userId,
      keyId: publicKeyId,
    })
    .catch((err) => {
      logMessage.error(err);
      return null;
    });

  if (publicKeyId === remoteKey?.key?.id) {
    return true;
  }
  // Key are out of sync or user does not exist
  return false;
};

export const refreshKey = async (templateId: string) => {
  const { ability } = await authCheckAndThrow();
  await checkUserHasTemplateOwnership(ability, templateId);

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

  const zitadel = await getZitadelClient();
  await zitadel
    .removeMachineKey({
      userId: serviceAccountId,
      keyId: publicKeyId,
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Failed to delete key");
    });

  const { privateKey, publicKey } = generateKeys();

  const keyId = await uploadKey(publicKey, serviceAccountId);
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

  const serviceAccountId = await getMachineUser(templateId);

  const { privateKey, publicKey } = generateKeys();

  const keyId = await uploadKey(publicKey, serviceAccountId);

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
