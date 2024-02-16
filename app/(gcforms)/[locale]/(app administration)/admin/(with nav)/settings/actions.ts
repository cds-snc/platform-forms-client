"use server";
import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";
import { logMessage } from "@lib/logger";
import { createAppSetting, deleteAppSetting, updateAppSetting } from "@lib/appSettings";
import { revalidatePath } from "next/cache";

// TODO error handling
export async function updateSetting(internalId: string, setting: Record<string, unknown>) {
  const session = await auth();
  if (!session) throw new Error("No session");
  const ability = createAbility(session);

  logMessage.debug(`Updating setting ${internalId} to ${setting}`);
  const updatedSetting = await updateAppSetting(ability, internalId, setting);

  logMessage.debug(`Updated setting: ${JSON.stringify(updatedSetting)}`);

  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings_server");

  // TODO come back to whether this is or should be returning anything
  // return updatedSetting;
}

// TODO error handling
export async function createSetting(internalId: string, setting: Record<string, unknown>) {
  const session = await auth();
  if (!session) throw new Error("No session");
  const ability = createAbility(session);

  logMessage.debug(`Creating setting ${internalId}`);
  const createdSetting = await createAppSetting(
    ability,
    setting as {
      internalId: string;
      nameEn: string;
      nameFr: string;
    }
  );

  logMessage.debug(`Created setting: ${JSON.stringify(createdSetting)}`);

  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings_server");

  // TODO come back to whether this is or should be returning anything
  // return createdSetting;
}

// TODO error handling
export async function deleteSetting(internalId: string) {
  const session = await auth();
  if (!session) throw new Error("No session");
  const ability = createAbility(session);

  logMessage.debug(`Deleting setting ${internalId}`);
  await deleteAppSetting(ability, internalId);

  logMessage.debug(`Deleted setting: ${internalId}`);

  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings_server");

  // TODO come back to whether this is or should be returning anything
  // return "ok";
}
