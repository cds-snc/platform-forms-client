"use server";

import { enableFlag, disableFlag } from "@lib/cache/flags";
import { revalidatePath } from "next/cache";
import { AuthenticatedAction } from "@lib/actions";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

// Note: any thrown errors will be caught in the Error boundary/component

export const modifyFlag = AuthenticatedAction(async (_, id: string, value: boolean) => {
  if (value) {
    await enableFlag(id);
  } else {
    await disableFlag(id);
  }
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/flags", "page");
});

export const removeUserFlag = AuthenticatedAction(async (_, userId: string, flag: string) => {
  const { removeUserFeatureFlag } = await import("@lib/userFeatureFlags");
  await removeUserFeatureFlag(userId, flag);
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/flags", "page");
});
