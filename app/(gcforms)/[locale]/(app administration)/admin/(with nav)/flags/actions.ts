"use server";
import { enableFlag, disableFlag, checkAll, checkOne } from "@lib/cache/flags";
import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";
import { revalidatePath } from "next/cache";

// Note: any thrown errors will be caught in the Error boundary/component

export async function modifyFlag(id: string, value: boolean) {
  const session = await auth();
  if (!session) throw new Error("No session");
  const ability = createAbility(session);

  if (value) {
    await enableFlag(ability, id);
  } else {
    await disableFlag(ability, id);
  }
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/flags", "page");
}

export async function getAllFlags() {
  const session = await auth();
  if (!session) throw new Error("No session");
  const ability = createAbility(session);

  return checkAll(ability);
}

export async function checkFlag(id: string) {
  const session = await auth();
  if (!session) throw new Error("No session");

  return checkOne(id);
}
