"use server";
import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";
import {
  createAppSetting,
  deleteAppSetting,
  getFullAppSetting,
  updateAppSetting,
} from "@lib/appSettings";
import { revalidatePath } from "next/cache";
import { logMessage } from "@lib/logger";

function nullCheck(formData: FormData, key: string) {
  const result = formData.get(key);
  if (!result) throw new Error(`No value found for ${key}`);
  return result as string;
}

export const authCheck = async () => {
  const session = await auth();
  if (!session) throw new Error("No session found");
  return createAbility(session);
};

export async function getSetting(internalId: string) {
  const ability = await authCheck();
  logMessage.error("Getting setting with internalId: " + internalId);
  return getFullAppSetting(ability, internalId);
}

export async function updateSetting(formData: FormData) {
  try {
    const ability = await authCheck();
    const setting = {
      internalId: nullCheck(formData, "internalId"),
      nameEn: nullCheck(formData, "nameEn"),
      nameFr: nullCheck(formData, "nameFr"),
      descriptionEn: formData.get("descriptionEn") as string,
      descriptionFr: formData.get("descriptionFr") as string,
      value: nullCheck(formData, "value"),
    };

    await updateAppSetting(ability, setting.internalId, setting);
  } catch (e) {
    logMessage.error("Error updating setting: " + e);
    throw e;
  }
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings", "page");
}

export async function createSetting(formData: FormData) {
  try {
    const ability = await authCheck();
    const setting = {
      internalId: nullCheck(formData, "internalId"),
      nameEn: nullCheck(formData, "nameEn"),
      nameFr: nullCheck(formData, "nameFr"),
      descriptionEn: formData.get("descriptionEn") as string,
      descriptionFr: formData.get("descriptionFr") as string,
      value: nullCheck(formData, "value"),
    };
    await createAppSetting(
      ability,
      setting as {
        internalId: string;
        nameEn: string;
        nameFr: string;
      }
    );
  } catch (e) {
    logMessage.error("Error creating setting: " + e);
    throw e;
  }
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings", "page");
}

export async function deleteSetting(internalId: string) {
  const ability = await authCheck();
  await deleteAppSetting(ability, internalId).catch(() => {
    throw new Error("Error deleting setting");
  });
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings", "page");
}
