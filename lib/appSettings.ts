import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { AccessControlError, checkPrivileges } from "./privileges";
import { logEvent } from "./auditLogs";
import { logMessage } from "@lib/logger";
import { UserAbility } from "./types";
import { settingCheck, settingPut, settingDelete } from "@lib/cache/settingCache";

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
  return uncachedSetting?.value;
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
    logMessage.error(e);
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
    logMessage.error(e);
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
      logEvent(ability.userID, { type: "Setting" }, "AccessDenied", "Attempted to delete setting");
      throw e;
    }
    logMessage.error(e);
  }
};
