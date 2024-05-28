"use server";
import { enableFlag, disableFlag, checkAll, checkOne } from "@lib/cache/flags";
import { revalidatePath } from "next/cache";
import { authCheckAndThrow } from "@lib/actions";

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

export async function getAllFlags() {
  const { ability } = await authCheckAndThrow();

  return checkAll(ability);
}

export async function checkFlag(id: string) {
  await authCheckAndThrow();

  return checkOne(id);
}
