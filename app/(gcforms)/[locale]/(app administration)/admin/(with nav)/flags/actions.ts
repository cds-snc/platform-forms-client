"use server";

import { enableFlag, disableFlag } from "@lib/cache/flags";
import { revalidatePath } from "next/cache";
import { authCheckAndThrow } from "@lib/actions";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

// Note: any thrown errors will be caught in the Error boundary/component

export async function modifyFlag(id: string, value: boolean) {
  const { ability } = await authCheckAndThrow();

  if (value) {
    await enableFlag(ability, id);
  } else {
    await disableFlag(ability, id);
  }
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/flags", "page");
}
