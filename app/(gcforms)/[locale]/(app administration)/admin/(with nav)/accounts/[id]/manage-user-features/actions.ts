"use server";
import { addUserFeatureFlags, removeUserFeatureFlag } from "@lib/userFeatureFlags";
import { revalidatePath } from "next/cache";
import { AuthenticatedAction } from "@lib/actions";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

// Note: any thrown errors will be caught in the Error boundary/component

export const setUserFlags = AuthenticatedAction(async (_, userId: string, flags: string[]) => {
  await addUserFeatureFlags(userId, flags);
  revalidatePath(
    "(gcforms)/[locale]/(app administration)/admin/(with nav)/accounts/[id]/manage-user-features",
    "page"
  );
});

export const removeUserFlag = AuthenticatedAction(async (_, userId: string, flag: string) => {
  await removeUserFeatureFlag(userId, flag);
  revalidatePath(
    "(gcforms)/[locale]/(app administration)/admin/(with nav)/accounts/[id]/manage-user-features",
    "page"
  );
});
