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

export const authCheck = async () => {
  const session = await auth();
  if (!session) throw new Error("No session found");
  return createAbility(session);
};

export async function getSetting(internalId: string) {
  const ability = await authCheck();
  return getFullAppSetting(ability, internalId);
}

export async function updateSetting(formData: FormData) {
  const ability = await authCheck();
  const setting = {
    internalId: formData.get("internalId") as string,
    nameEn: formData.get("nameEn") as string,
    nameFr: formData.get("nameFr") as string,
    descriptionEn: formData.get("descriptionEn") as string,
    descriptionFr: formData.get("descriptionFr") as string,
    value: formData.get("value") as string,
  };
  await updateAppSetting(ability, setting.internalId, setting).catch(() => {
    throw new Error("Error updating setting");
  });
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings", "page");
}

export async function createSetting(formData: FormData) {
  const ability = await authCheck();
  const setting = {
    internalId: formData.get("internalId") as string,
    nameEn: formData.get("nameEn") as string,
    nameFr: formData.get("nameFr") as string,
    descriptionEn: formData.get("descriptionEn") as string,
    descriptionFr: formData.get("descriptionFr") as string,
    value: formData.get("value") as string,
  };
  await createAppSetting(
    ability,
    setting as {
      internalId: string;
      nameEn: string;
      nameFr: string;
    }
  ).catch(() => {
    throw new Error("Error creating setting");
  });
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings", "page");
}

export async function deleteSetting(internalId: string) {
  const ability = await authCheck();
  await deleteAppSetting(ability, internalId).catch(() => {
    throw new Error("Error deleting setting");
  });
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings", "page");
}
