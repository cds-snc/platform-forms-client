"use server";

import { updateAppSettingValue } from "@lib/appSettings";
import { revalidatePath } from "next/cache";
import { AuthenticatedAction } from "@lib/actions";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const saveSettingValue = AuthenticatedAction(
  async (_, internalId: string, value: string) => {
    const setting = await updateAppSettingValue(internalId, value);
    if (!setting) throw new Error("Setting not found");
    revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings", "page");
    return setting.value;
  }
);
