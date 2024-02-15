"use server";
import { enableFlag, disableFlag, checkAll } from "@lib/cache/flags";
import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";

export async function modifyFlag(id: string, value: boolean) {
  const session = await auth();
  if (!session) throw new Error("No session");

  const ability = createAbility(session);

  if (value) {
    await enableFlag(ability, id);
  } else {
    await disableFlag(ability, id);
  }
  const newFlags = await checkAll(ability);

  return newFlags;
}
