import { prisma, prismaErrors } from "@gcforms/database";
import { authorization } from "./privileges";
import { AccessControlError } from "@lib/auth/errors";
import { AuditLogAccessDeniedDetails, AuditLogDetails, logEvent } from "./auditLogs";
import { logMessage } from "@lib/logger";
import { settingCheck, settingPut } from "@lib/cache/settingCache";

export type AppSettingType = "string" | "boolean" | "number";

export const getAllAppSettings = async (language = "en") => {
  const { user } = await authorization.canAccessSettings().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(
        e.user.id,
        { type: "Setting" },
        "AccessDenied",
        AuditLogAccessDeniedDetails.AccessDenied_AttemptToListAllSettings
      );
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
        type: true,
        groupEn: true,
        groupFr: true,
        value: true,
      },
    })
    .catch((e) => prismaErrors(e, []));
  const collator = new Intl.Collator(language, { numeric: true, sensitivity: "base" });
  settings.sort((a, b) => {
    const groupA = language === "fr" ? a.groupFr : a.groupEn;
    const groupB = language === "fr" ? b.groupFr : b.groupEn;
    const nameA = language === "fr" ? a.nameFr : a.nameEn;
    const nameB = language === "fr" ? b.nameFr : b.nameEn;
    const groupOrder =
      groupA && groupB ? collator.compare(groupA, groupB) : groupA ? -1 : groupB ? 1 : 0;
    return (
      groupOrder ||
      collator.compare(nameA, nameB) ||
      (a.internalId < b.internalId ? -1 : a.internalId > b.internalId ? 1 : 0)
    );
  });
  logEvent(user.id, { type: "Setting" }, "ListAllSettings");
  return settings;
};

export const getAppSetting = async (internalId: string) => {
  const cachedSetting = await settingCheck(internalId);
  if (cachedSetting !== null) return cachedSetting;

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

  if (uncachedSetting?.value !== null && uncachedSetting?.value !== undefined) {
    settingPut(internalId, uncachedSetting.value);
  }
  return uncachedSetting?.value ?? null;
};

export const getAppSettingAsBoolean = async (internalId: string) => {
  const value = await getAppSetting(internalId);
  // `ON` is accepted for backwards compatibility with existing runtime values.
  return value === "true" || value?.toUpperCase() === "ON";
};

export const getFullAppSetting = async (internalId: string) => {
  const { user } = await authorization.canAccessSettings().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(
        e.user.id,
        { type: "Setting", id: internalId },
        "AccessDenied",
        AuditLogAccessDeniedDetails.AccessDenied_AttemptToListFullAppSettings
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
        type: true,
        groupEn: true,
        groupFr: true,
        value: true,
      },
    })
    .catch((e) => {
      prismaErrors(e, null);
    });

  logEvent(user.id, { type: "Setting" }, "ListSetting");
  return result;
};

export const updateAppSettingValue = async (internalId: string, value: string) => {
  const { user } = await authorization.canManageSettings().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(
        e.user.id,
        { type: "Setting", id: internalId },
        "AccessDenied",
        AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateSetting
      );
    }
    throw e;
  });

  const setting = await prisma.setting
    .findUnique({ where: { internalId }, select: { type: true } })
    .catch((e) => prismaErrors(e, null));
  if (!setting) return null;

  const settingType = setting.type as AppSettingType;
  const validValue =
    settingType === "boolean"
      ? ["true", "false", "ON", "OFF"].includes(value)
      : settingType === "number"
        ? value.trim() !== "" && Number.isFinite(Number(value))
        : settingType === "string";
  if (!validValue) {
    throw new Error(`Invalid ${setting.type} value for setting ${internalId}`);
  }

  const updatedSetting = await prisma.setting
    .update({
      where: {
        internalId,
      },
      data: { value },
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
    AuditLogDetails.UpdatedAppSetting,
    { settingData: JSON.stringify({ value }) }
  );
  settingPut(internalId, value);
  return updatedSetting;
};
