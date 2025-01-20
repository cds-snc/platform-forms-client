"use server";

import { deleteAppSetting } from "@lib/appSettings";
import { revalidatePath } from "next/cache";
import { AuthenticatedAction } from "@lib/actions";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const deleteSetting = AuthenticatedAction(async (_, internalId: string) => {
  await deleteAppSetting(internalId).catch(() => {
    throw new Error("Error deleting setting");
  });
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/settings", "page");
});
