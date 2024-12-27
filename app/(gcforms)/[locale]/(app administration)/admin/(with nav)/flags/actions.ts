"use server";
import { enableFlag, disableFlag, checkAll, checkOne } from "@lib/cache/flags";
import { revalidatePath } from "next/cache";
import { AuthenticatedAction } from "@lib/actions";

// Note: any thrown errors will be caught in the Error boundary/component

export const modifyFlag = AuthenticatedAction(async (id: string, value: boolean) => {
  if (value) {
    await enableFlag(id);
  } else {
    await disableFlag(id);
  }
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/flags", "page");
});

export const getAllFlags = AuthenticatedAction(() => {
  return checkAll();
});

export const checkFlag = AuthenticatedAction((id: string) => {
  return checkOne(id);
});
