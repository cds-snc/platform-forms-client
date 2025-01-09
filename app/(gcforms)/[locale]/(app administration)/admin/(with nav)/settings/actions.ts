"use server";

import {
  createAppSetting,
  deleteAppSetting,
  getFullAppSetting,
  updateAppSetting,
} from "@lib/appSettings";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthenticatedAction } from "@lib/actions";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const getSetting = AuthenticatedAction(async (_, internalId: string) => {
  return getFullAppSetting(internalId);
});

export const updateSetting = AuthenticatedAction(
  async (_, language: string, formData: FormData) => {
    try {
      const setting = {
        internalId: nullCheck(formData, "internalId"),
        nameEn: nullCheck(formData, "nameEn"),
        nameFr: nullCheck(formData, "nameFr"),
        descriptionEn: formData.get("descriptionEn") as string,
        descriptionFr: formData.get("descriptionFr") as string,
        value: nullCheck(formData, "value"),
      };

      await updateAppSetting(setting.internalId, setting);
    } catch (e) {
      redirect(`/${language}/admin/settings?error=errorUpdating`);
    }
    redirect(`/${language}/admin/settings?success=updated`);
  }
);

export const createSetting = AuthenticatedAction(
  async (_, language: string, formData: FormData) => {
    try {
      const setting = {
        internalId: nullCheck(formData, "internalId"),
        nameEn: nullCheck(formData, "nameEn"),
        nameFr: nullCheck(formData, "nameFr"),
        descriptionEn: formData.get("descriptionEn") as string,
        descriptionFr: formData.get("descriptionFr") as string,
        value: nullCheck(formData, "value"),
      };
      await createAppSetting(
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
);

export const deleteSetting = AuthenticatedAction(async (_, internalId: string) => {
  await deleteAppSetting(internalId).catch(() => {
    throw new Error("Error deleting setting");
  });
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings", "page");
});

// Internal and private functions - won't be converted into server actions

function nullCheck(formData: FormData, key: string) {
  const result = formData.get(key);
  if (!result) throw new Error(`No value found for ${key}`);
  return result as string;
}
