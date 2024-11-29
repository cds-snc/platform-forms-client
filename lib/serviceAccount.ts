import crypto from "crypto";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { logMessage } from "@lib/logger";
import { logEvent } from "@lib/auditLogs";
import { authCheckAndThrow } from "@lib/actions";
import { checkUserHasTemplateOwnership } from "@lib/templates";
import { getZitadelClient } from "@lib/integration/zitadelConnector";

type ApiPrivateKey = {
  type: string;
  keyId: string;
  key: string;
  userId: string;
  formId: string;
};

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
      throw new Error(`Could not create User ${templateId} on Identity Provider`);
    });
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
  return user?.id;
};

const deleteMachineUser = async (userId: string) => {
  const zitadel = await getZitadelClient();
  await zitadel
    .removeUser({
      id: userId,
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error(`Could not delete User ${userId} on Identity Provider`);
    });
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
      throw new Error(`Failed to create key for form ${userId}`);
    });
  return keyId;
};

export const deleteKey = async (templateId: string) => {
  const { ability } = await authCheckAndThrow();
  await checkUserHasTemplateOwnership(ability, templateId);

  const serviceAccountID = await checkMachineUserExists(templateId);

  if (serviceAccountID) {
    await deleteMachineUser(serviceAccountID);
  }

  await prisma.apiServiceAccount
    .deleteMany({
      where: {
        templateId: templateId,
      },
    })
    .catch((e) => prismaErrors(e, null));

  logEvent(
    ability.userID,
    { type: "ServiceAccount" },
    "DeleteAPIKey",
    `User :${ability.userID} deleted service account ${
      serviceAccountID ? `${serviceAccountID}` : `for template ${templateId}`
    }`
  );
};

export const checkMachineUserExists = async (templateId: string) => {
  const { ability } = await authCheckAndThrow();
  await checkUserHasTemplateOwnership(ability, templateId);
  return getMachineUser(templateId);
};

/*
 * This function is used to get the public key id of the service account
 * associated with the templateId.
 */
export const _getApiUserPublicKeyId = async (templateId: string) => {
  const result = { userId: null, publicKeyId: null };

  if (templateId === "0000") {
    return result;
  }

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
  const { userId, publicKeyId } = await _getApiUserPublicKeyId(templateId);
  if (!userId || !publicKeyId) {
    return false;
  }

  try {
    const zitadel = await getZitadelClient();
    const remoteKey = await zitadel.getMachineKeyByIDs({
      userId,
      keyId: publicKeyId,
    });

    if (publicKeyId === remoteKey?.key?.id) {
      return remoteKey?.key?.id;
    }

    return false;
  } catch (e) {
    logMessage.error(e);
    return false;
  }
};

export const refreshKey = async (templateId: string) => {
  const { ability } = await authCheckAndThrow();
  await checkUserHasTemplateOwnership(ability, templateId);

  // Check if we're in a weird state and return an error to get support involved
  const remoteServiceAccountId = await checkMachineUserExists(templateId).then(
    (serviceAccountId) => {
      if (!serviceAccountId) {
        throw new Error(
          `Service Account User for template ${templateId} does not exist when trying to refresh API Key`
        );
      }
      return serviceAccountId;
    }
  );

  const { id: serviceAccountId, publicKeyId } =
    (await prisma.apiServiceAccount.findUnique({
      where: {
        templateId: templateId,
      },
      select: { id: true, publicKeyId: true },
    })) ?? {};

  if (!serviceAccountId || !publicKeyId) {
    throw new Error(`No Key Exists in GCForms DB for template ${templateId}`);
  }

  if (serviceAccountId !== remoteServiceAccountId) {
    // The app and IDP are our of sync.
    // This is a critical error and should be investigated by support
    throw new Error(
      `Service Account User ID for template ${templateId} is out of sync between GCForms and Zitadel`
    );
  }

  const zitadel = await getZitadelClient();
  await zitadel
    .removeMachineKey({
      userId: serviceAccountId,
      keyId: publicKeyId,
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error(`Failed to delete key in Zitadel for template ${templateId}`);
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
    `User :${ability.userID} refreshed API key for service account ${serviceAccountId}`
  );

  return buildApiPrivateKeyData(keyId, privateKey, serviceAccountId, templateId);
};

export const createKey = async (templateId: string) => {
  const { ability } = await authCheckAndThrow();
  await checkUserHasTemplateOwnership(ability, templateId);

  const serviceAccountId = await getMachineUser(templateId).then((user) => {
    // If a user does not exist then create one
    if (!user) {
      return createMachineUser(templateId);
    }
    return user;
  });

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
    `User :${ability.userID} created API key for service account ${serviceAccountId}`
  );

  return buildApiPrivateKeyData(keyId, privateKey, serviceAccountId, templateId);
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
