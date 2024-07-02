import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { AccessControlError, checkPrivileges } from "./privileges";
import { logEvent } from "./auditLogs";
import { logMessage } from "@lib/logger";
import { UserAbility } from "./types";
import { settingCheck, settingPut, settingDelete } from "@lib/cache/settingCache";
import crypto from "crypto";

export const getAllAppSettings = async (ability: UserAbility) => {
  try {
    checkPrivileges(ability, [{ action: "view", subject: "Setting" }]);
    const settings = await prisma.setting
      .findMany({
        select: {
          internalId: true,
          nameEn: true,
          nameFr: true,
          descriptionEn: true,
          descriptionFr: true,
          value: true,
          encrypted: true,
        },
      })
      .catch((e) => prismaErrors(e, []));
    logEvent(ability.userID, { type: "Setting" }, "ListAllSettings");
    return settings;
  } catch (e) {
    if (e instanceof AccessControlError) {
      logEvent(ability.userID, { type: "Setting" }, "AccessDenied", "Attempted to list all Forms");
      throw e;
    }
    logMessage.error(e);
    return [];
  }
};

export const getAppSetting = async (internalId: string) => {
  const cachedSetting = await settingCheck(internalId);
  if (cachedSetting) return cachedSetting;

  const uncachedSetting = await prisma.setting
    .findUnique({
      where: {
        internalId,
      },
      select: {
        value: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (uncachedSetting?.value) {
    settingPut(internalId, uncachedSetting.value);
  }
  return uncachedSetting?.value ?? null;
};

export const getFullAppSetting = async (ability: UserAbility, internalId: string) => {
  checkPrivileges(ability, [{ action: "view", subject: "Setting" }]);
  // Note: the setting is not cached here because it's not expected to be called frequently
  const result = prisma.setting
    .findUnique({
      where: {
        internalId,
      },
      select: {
        internalId: true,
        nameEn: true,
        nameFr: true,
        descriptionEn: true,
        descriptionFr: true,
        value: true,
        encrypted: true,
      },
    })
    .catch((e) => {
      if (e instanceof AccessControlError) {
        logEvent(
          ability.userID,
          { type: "Setting", id: internalId },
          "AccessDenied",
          "Attempted to get full setting"
        );
        throw e;
      }
      prismaErrors(e, null);
    });

  logEvent(ability.userID, { type: "Setting" }, "ListSetting");
  return result;
};

interface SettingUpdateData {
  nameEn?: string;
  nameFr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  value?: string;
}
export const updateAppSetting = async (
  ability: UserAbility,
  internalId: string,
  settingData: SettingUpdateData
) => {
  try {
    checkPrivileges(ability, [{ action: "update", subject: "Setting" }]);

    // Is the setting protected by encryption?

    const { encrypted } = await prisma.setting.findUniqueOrThrow({
      where: {
        internalId,
      },
      select: {
        encrypted: true,
      },
    });

    if (encrypted && settingData.value) {
      settingData.value = encryptSetting(settingData.value);
    }

    const updatedSetting = await prisma.setting.update({
      where: {
        internalId,
      },
      data: settingData,
    });
    logEvent(
      ability.userID,
      { type: "Setting", id: internalId },
      "ChangeSetting",
      `Updated setting with ${JSON.stringify(settingData)}`
    );
    if (settingData.value) {
      // Add the setting to the Settings cache
      settingPut(internalId, settingData.value);
    }
    return updatedSetting;
  } catch (e) {
    if (e instanceof AccessControlError) {
      logEvent(
        ability.userID,
        { type: "Setting", id: internalId },
        "AccessDenied",
        "Attempted to update setting"
      );
      throw e;
    }
    if (e instanceof Error) {
      logMessage.warn(
        `Could not update setting with internalId: ${internalId} due to error: ${e.message}`
      );
    }
    return null;
  }
};

interface SettingCreateData extends SettingUpdateData {
  internalId: string;
  nameEn: string;
  nameFr: string;
}
export const createAppSetting = async (ability: UserAbility, settingData: SettingCreateData) => {
  try {
    checkPrivileges(ability, [{ action: "create", subject: "Setting" }]);

    const createdSetting = await prisma.setting.create({
      data: settingData,
    });
    logEvent(
      ability.userID,
      { type: "Setting", id: createdSetting.internalId },
      "CreateSetting",
      `Created setting with ${JSON.stringify(settingData)}`
    );
    if (settingData.value) {
      settingPut(settingData.internalId, settingData.value);
    }
    return createdSetting;
  } catch (e) {
    if (e instanceof AccessControlError) {
      logEvent(ability.userID, { type: "Setting" }, "AccessDenied", "Attempted to create setting");
      throw e;
    }
    if (e instanceof Error) {
      logMessage.warn(
        `Could not create setting with name: ${settingData.nameEn} due to error: ${e.message}`
      );
    }
    return null;
  }
};

export const deleteAppSetting = async (ability: UserAbility, internalId: string) => {
  try {
    checkPrivileges(ability, [{ action: "delete", subject: "Setting" }]);

    const deletedSetting = await prisma.setting.delete({
      where: {
        internalId,
      },
    });
    logEvent(
      ability.userID,
      { type: "Setting", id: internalId },
      "DeleteSetting",
      `Deleted setting with ${JSON.stringify(deletedSetting)}`
    );
    settingDelete(internalId);
  } catch (e) {
    if (e instanceof AccessControlError) {
      logEvent(
        ability.userID,
        { id: internalId, type: "Setting" },
        "AccessDenied",
        "Attempted to delete setting"
      );
      throw e;
    }
    if (e instanceof Error) {
      logMessage.warn(
        `Could not delete setting with internalId: ${internalId} due to error: ${e.message}`
      );
    }
  }
};

const encryptSetting = (value: string) => {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) throw new Error("No Secret Available to Encrypt Settings");

  const iv = crypto.randomBytes(16);
  const key = crypto.createHash("sha256").update(secret).digest("base64").substring(0, 32);

  const cipher = crypto.createCipheriv("aes-256-ctr", key, iv);
  const result = Buffer.concat([iv, cipher.update(value), cipher.final()]);

  return result.toString("base64");
};

export const decryptSetting = (value: string) => {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) throw new Error("No Secret Available to Decrypt Settings");

  const encryptedValue = Buffer.from(value, "base64");
  const key = crypto.createHash("sha256").update(secret).digest("base64").substring(0, 32);
  const decipher = crypto.createDecipheriv("aes-256-ctr", key, encryptedValue.subarray(0, 16));
  const decrypted = Buffer.concat([decipher.update(encryptedValue.subarray(16)), decipher.final()]);
  return decrypted.toString();
};
