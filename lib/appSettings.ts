import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { authorization } from "./privileges";
import { AccessControlError } from "@lib/auth/errors";
import { logEvent } from "./auditLogs";
import { logMessage } from "@lib/logger";
import { settingCheck, settingPut, settingDelete } from "@lib/cache/settingCache";

export const getAllAppSettings = async () => {
  const { user } = await authorization.canAccessSettings().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(e.user.id, { type: "Setting" }, "AccessDenied", "Attempted to list all Settings");
    }
    throw e;
  });

  const settings = await prisma.setting
    .findMany({
      select: {
        internalId: true,
        nameEn: true,
        nameFr: true,
        descriptionEn: true,
        descriptionFr: true,
        value: true,
      },
    })
    .catch((e) => prismaErrors(e, []));
  logEvent(user.id, { type: "Setting" }, "ListAllSettings");
  return settings;
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

export const getFullAppSetting = async (internalId: string) => {
  const { user } = await authorization.canAccessSettings().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(
        e.user.id,
        { type: "Setting", id: internalId },
        "AccessDenied",
        "Attempted to list full app Setting"
      );
    }
    throw e;
  });
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
      },
    })
    .catch((e) => {
      prismaErrors(e, null);
    });

  logEvent(user.id, { type: "Setting" }, "ListSetting");
  return result;
};

interface SettingUpdateData {
  nameEn?: string;
  nameFr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  value?: string;
}
export const updateAppSetting = async (internalId: string, settingData: SettingUpdateData) => {
  const { user } = await authorization.canManageSettings().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(
        e.user.id,
        { type: "Setting", id: internalId },
        "AccessDenied",
        "Attempted to update setting"
      );
    }
    throw e;
  });

  const updatedSetting = await prisma.setting
    .update({
      where: {
        internalId,
      },
      data: settingData,
    })
    .catch((e) => {
      logMessage.warn(
        `Could not update setting with internalId: ${internalId} due to error: ${e.message}`
      );
      return prismaErrors(e, null);
    });
  // If there was a prisma error return early
  if (updatedSetting === null) return null;

  logEvent(
    user.id,
    { type: "Setting", id: internalId },
    "ChangeSetting",
    `Updated setting with ${JSON.stringify(settingData)}`
  );
  if (settingData.value) {
    settingPut(internalId, settingData.value);
  }
  return updatedSetting;
};

interface SettingCreateData extends SettingUpdateData {
  internalId: string;
  nameEn: string;
  nameFr: string;
}
export const createAppSetting = async (settingData: SettingCreateData) => {
  const { user } = await authorization.canManageSettings().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(e.user.id, { type: "Setting" }, "AccessDenied", "Attempted to create setting");
    }
    throw e;
  });

  const createdSetting = await prisma.setting
    .create({
      data: settingData,
    })
    .catch((e) => {
      logMessage.warn(
        `Could not create setting with name: ${settingData.nameEn} due to error: ${e.message}`
      );
      return prismaErrors(e, null);
    });
  // If there was a prisma error return early
  if (createdSetting === null) return null;

  logEvent(
    user.id,
    { type: "Setting", id: createdSetting.internalId },
    "CreateSetting",
    `Created setting with ${JSON.stringify(settingData)}`
  );
  if (settingData.value) {
    settingPut(settingData.internalId, settingData.value);
  }
  return createdSetting;
};

export const deleteAppSetting = async (internalId: string) => {
  const { user } = await authorization.canManageSettings().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(
        e.user.id,
        { type: "Setting", id: internalId },
        "AccessDenied",
        "Attempted to delete setting"
      );
    }
    throw e;
  });

  const deletedSetting = await prisma.setting
    .delete({
      where: {
        internalId,
      },
    })
    .catch((e) => {
      logMessage.warn(
        `Could not delete setting with internalId: ${internalId} due to error: ${e.message}`
      );
      return prismaErrors(e, null);
    });
  // return early if there was a prisma error
  if (deletedSetting === null) return null;

  logEvent(
    user.id,
    { type: "Setting", id: internalId },
    "DeleteSetting",
    `Deleted setting with ${JSON.stringify(deletedSetting)}`
  );
  settingDelete(internalId);
};
