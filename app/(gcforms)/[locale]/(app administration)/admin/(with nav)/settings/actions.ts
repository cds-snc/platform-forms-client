"use server";
import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";
import {
  createAppSetting,
  deleteAppSetting,
  getAppSetting,
  updateAppSetting,
} from "@lib/appSettings";
import { revalidatePath } from "next/cache";

// TODO error handling

export async function getSetting(internalId: string) {
  const session = await auth();
  if (!session) throw new Error("No session");

  const setting = await getAppSetting(internalId);

  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings");

  return setting;
}

export async function updateSetting(internalId: string, setting: Record<string, unknown>) {
  const session = await auth();
  if (!session) throw new Error("No session");
  const ability = createAbility(session);

  const updatedSetting = await updateAppSetting(ability, internalId, setting);

  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings");

  return updatedSetting;
}

export async function createSetting(internalId: string, setting: Record<string, unknown>) {
  const session = await auth();
  if (!session) throw new Error("No session");
  const ability = createAbility(session);

  const createdSetting = await createAppSetting(
    ability,
    setting as {
      internalId: string;
      nameEn: string;
      nameFr: string;
    }
  );

  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings");

  return createdSetting;
}

export async function deleteSetting(internalId: string) {
  const session = await auth();
  if (!session) throw new Error("No session");
  const ability = createAbility(session);

  await deleteAppSetting(ability, internalId);

  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings");

  return "ok";
}
