"use server";

import {
  createAppSetting,
  deleteAppSetting,
  getFullAppSetting,
  updateAppSetting,
} from "@lib/appSettings";
import { revalidatePath } from "next/cache";
import { authCheckAndThrow } from "@lib/actions";
import { redirect } from "next/navigation";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export async function getSetting(internalId: string) {
  const { ability } = await authCheckAndThrow();
  return getFullAppSetting(ability, internalId);
}

export async function updateSetting(language: string, formData: FormData) {
  try {
    const { ability } = await authCheckAndThrow();
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
    redirect(`/${language}/admin/settings?error=errorUpdating`);
  }
  redirect(`/${language}/admin/settings?success=updated`);
}

export async function createSetting(language: string, formData: FormData) {
  try {
    const { ability } = await authCheckAndThrow();
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
    redirect(`/${language}/admin/settings?error=errorCreating`);
  }
  redirect(`/${language}/admin/settings?success=created`);
}

export async function deleteSetting(internalId: string) {
  const { ability } = await authCheckAndThrow();
  await deleteAppSetting(ability, internalId).catch(() => {
    throw new Error("Error deleting setting");
  });
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings", "page");
}

// Internal and private functions - won't be converted into server actions

function nullCheck(formData: FormData, key: string) {
  const result = formData.get(key);
  if (!result) throw new Error(`No value found for ${key}`);
  return result as string;
}
